// Comments.js
import React, { useState, useEffect, useContext } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import myContext from "../../context/myContext";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import './Comments.css';

const Comments = ({ productId }) => {
    const { loading, setLoading } = useContext(myContext);
    const auth = getAuth();
    const user = auth.currentUser;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

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

    return (
        <div className="comments-container">
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
            {comments.map((comment) => (
                <div key={comment.id} className="comment">
                    <p>
                        <strong>{comment.userName}</strong>: {comment.text}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default Comments;
