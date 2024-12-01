// Comments.js
import React, { useState, useEffect, useContext } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import myContext from "../../context/myContext";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CommentIcon from '@mui/icons-material/Comment';
import './Comments.css';

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
            console.error("Error adding comment: ", error);
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
        <div>
            <Button onClick={() => setIsModalOpen(true)} startIcon={<CommentIcon />}>
                {/* Removed text, using icon only */}
            </Button>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h3>Comments</h3>
                        {user ? (
                            <div className="comment-input-container">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                />
                                <button onClick={handleCommentSubmit} disabled={loading}>
                                    Submit Comment
                                </button>
                            </div>
                        ) : (
                            <p>You must be logged in to post a comment.</p>
                        )}
                        {comments.length > 0 && (
                            <div className="comment-slider">
                                <Button onClick={prevComment} disabled={comments.length <= 1}>
                                    <ArrowBackIcon />
                                </Button>
                                <div className="comment">
                                    <p>
                                        <strong>{comments[currentIndex].userName}</strong>: {comments[currentIndex].text}
                                    </p>
                                </div>
                                <Button onClick={nextComment} disabled={comments.length <= 1}>
                                    <ArrowForwardIcon />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comments;
