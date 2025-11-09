// Comments.js
import React, { useState, useEffect, useContext } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import myContext from "../../context/myContext";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    TextField,
    IconButton,
    Box,
    Typography,
    Paper,
    Avatar,
    Divider,
    Chip,
    Badge
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const Comments = ({ productId }) => {
    const { loading, setLoading } = useContext(myContext);
    const auth = getAuth();
    const user = auth.currentUser;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!productId) {
            toast.error("Product ID is missing");
            return;
        }

        const q = query(
            collection(fireDB, "comments"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsArray = snapshot.docs
                .filter((doc) => doc.data().productId === productId)
                .map((doc) => ({ id: doc.id, ...doc.data() }));

            setComments(commentsArray);
        });

        return () => unsubscribe();
    }, [productId]);

    const handleCommentSubmit = async () => {
        if (!productId) {
            toast.error("Product ID is missing");
            return;
        }

        if (!newComment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        if (!user) {
            toast.error("You must be logged in to post a comment");
            return;
        }

        const userName = user.displayName || user.email || "Anonymous User";

        setLoading(true);
        try {
            const commentData = {
                productId,
                userName: userName,
                text: newComment,
                createdAt: new Date(),
            };

            await addDoc(collection(fireDB, "comments"), commentData);
            setNewComment("");
            toast.success("Comment added successfully!");
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setLoading(false);
        }
    };

    const nextComment = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % comments.length);
    };

    const prevComment = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + comments.length) % comments.length);
    };

    return (
        <Box>
            {/* Modern Comment Button */}
            <Badge 
                badgeContent={comments.length} 
                color="primary"
                sx={{
                    '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 600,
                    }
                }}
            >
                <IconButton
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        width: 48,
                        height: 48,
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <ChatBubbleOutlineIcon />
                </IconButton>
            </Badge>

            {/* Modern Dialog */}
            <Dialog 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                    }
                }}
            >
                {/* Dialog Header */}
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CommentIcon sx={{ fontSize: 28 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                                Comments
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => setIsModalOpen(false)}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                    {/* Comment Input Section */}
                    {user ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                mb: 3,
                                borderRadius: '16px',
                                border: '2px solid #e9ecef',
                                backgroundColor: 'white',
                            }}
                        >
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: '#495057',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 18 }} />
                                {user.displayName || user.email || "Anonymous User"}
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#f8f9fa',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        }
                                    }
                                }}
                            />
                            <Button
                                onClick={handleCommentSubmit}
                                disabled={loading || !newComment.trim()}
                                variant="contained"
                                endIcon={<SendIcon />}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    padding: '10px',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                    },
                                    '&:disabled': {
                                        background: '#ccc',
                                        color: '#666',
                                    }
                                }}
                            >
                                Post Comment
                            </Button>
                        </Paper>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: '16px',
                                backgroundColor: '#fff3cd',
                                border: '2px solid #ffc107',
                                textAlign: 'center',
                            }}
                        >
                            <Typography sx={{ color: '#856404', fontWeight: 500 }}>
                                Please log in to post a comment
                            </Typography>
                        </Paper>
                    )}

                    {/* Comments Display Section */}
                    {comments.length > 0 ? (
                        <Box>
                            <Divider sx={{ mb: 3 }}>
                                <Chip 
                                    label="All Comments" 
                                    sx={{
                                        backgroundColor: '#e7eaf6',
                                        color: '#667eea',
                                        fontWeight: 600,
                                    }}
                                />
                            </Divider>

                            {/* Comment Slider */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    justifyContent: 'space-between',
                                }}
                            >
                                <IconButton
                                    onClick={prevComment}
                                    disabled={comments.length <= 1}
                                    sx={{
                                        backgroundColor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        width: 40,
                                        height: 40,
                                        '&:hover': {
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#e9ecef',
                                        }
                                    }}
                                >
                                    <ArrowBackIosIcon sx={{ fontSize: 18, ml: 0.5 }} />
                                </IconButton>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        flex: 1,
                                        p: 3,
                                        borderRadius: '16px',
                                        backgroundColor: 'white',
                                        border: '2px solid #e9ecef',
                                        minHeight: '120px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                width: 36,
                                                height: 36,
                                                fontSize: '14px',
                                            }}
                                        >
                                            {comments[currentIndex].userName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography 
                                                variant="subtitle2" 
                                                sx={{ 
                                                    fontWeight: 700,
                                                    color: '#2c3e50',
                                                }}
                                            >
                                                {comments[currentIndex].userName}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: '#7f8c8d',
                                                }}
                                            >
                                                {comments[currentIndex].createdAt?.toDate?.().toLocaleDateString() || 'Just now'}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${currentIndex + 1}/${comments.length}`}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e7eaf6',
                                                color: '#667eea',
                                                fontWeight: 600,
                                                fontSize: '12px',
                                            }}
                                        />
                                    </Box>
                                    <Typography 
                                        sx={{ 
                                            color: '#495057',
                                            lineHeight: 1.6,
                                            fontSize: '15px',
                                        }}
                                    >
                                        {comments[currentIndex].text}
                                    </Typography>
                                </Paper>

                                <IconButton
                                    onClick={nextComment}
                                    disabled={comments.length <= 1}
                                    sx={{
                                        backgroundColor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        width: 40,
                                        height: 40,
                                        '&:hover': {
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#e9ecef',
                                        }
                                    }}
                                >
                                    <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: '16px',
                                backgroundColor: 'white',
                                border: '2px dashed #e9ecef',
                                textAlign: 'center',
                            }}
                        >
                            <CommentIcon sx={{ fontSize: 48, color: '#adb5bd', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#6c757d', fontWeight: 600, mb: 1 }}>
                                No comments yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#adb5bd' }}>
                                Be the first to share your thoughts!
                            </Typography>
                        </Paper>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Comments;
