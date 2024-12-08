import React, { useState, useContext, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Box, 
    Typography,
    FormControlLabel,
    Checkbox 
} from '@mui/material';
import MyContext from '../../context/myContext';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import toast, { Toaster } from 'react-hot-toast';
import CustomToast from '../../components/CustomToast/CustomToast';
import Rating from '@mui/material/Rating';

const TestimonialForm = ({ open, onClose }) => {
    const { addTestimonial, loading } = useContext(MyContext);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [userName, setUserName] = useState('');
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchUserName = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(fireDB, "user", user.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                    }
                } catch (error) {
                }
            }
        };
        fetchUserName();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim() || !rating) {
            toast.custom((t) => (
                <CustomToast 
                    t={t}
                    message="Please enter both comment and rating"
                    type="error"
                />
            ));
            return;
        }

        try {
            const testimonialData = {
                name: userName || user?.displayName || 'Anonymous',
                email: user?.email,
                uid: user?.uid,
                comment,
                rating,
                isAnonymous,
                photoURL: isAnonymous ? '' : (user?.photoURL || ""),
            };

            await addTestimonial(testimonialData);
            setComment('');
            setRating(0);
            setIsAnonymous(false);
            onClose();
        } catch (error) {
            toast.custom((t) => (
                <CustomToast 
                    t={t}
                    message="Failed to add testimonial"
                    type="error"
                />
            ));
        }
    };

    const handleClose = () => {
        setComment('');
        setRating(0);
        setIsAnonymous(false);
        onClose();
    };

    return (
        <>
            <Toaster position="bottom-center" />
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '16px'
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Box sx={{ 
                            display: 'inline-block', 
                            bgcolor: '#e8ffd1',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            mb: 1
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                SHARE YOUR EXPERIENCE
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            Tell us about your experience with our service
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography component="legend">Rate your experience</Typography>
                            <Rating
                                name="rating"
                                value={rating}
                                onChange={(event, newValue) => {
                                    setRating(newValue);
                                }}
                                size="large"
                            />
                        </Box>
                        <TextField
                            autoFocus
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            placeholder="Write your testimonial here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            sx={{ 
                                mt: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                }
                            }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Post anonymously"
                            sx={{ mt: 2 }}
                        />
                    </form>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleClose}
                        sx={{ 
                            color: 'text.secondary',
                            borderRadius: '8px',
                            px: 3
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !comment.trim()}
                        sx={{ 
                            bgcolor: '#e8ffd1',
                            color: 'text.primary',
                            borderRadius: '8px',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#d1ffb3',
                            },
                            '&:disabled': {
                                bgcolor: '#f5f5f5',
                            }
                        }}
                    >
                        {loading ? 'Submitting...' : 'Submit Testimonial'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TestimonialForm;