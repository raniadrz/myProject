/* eslint-disable react/no-unescaped-entities */
import { sendPasswordResetEmail, signInWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Divider,
    InputAdornment,
    IconButton,
} from "@mui/material";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { auth, fireDB } from "../../firebase/FirebaseConfig";
import './Login.css';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockResetIcon from '@mui/icons-material/LockReset';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SendIcon from '@mui/icons-material/Send';
// clearCartOnLogout,

//Login Page
const Login = () => {
    const context = useContext(myContext);
    const { loading, setLoading } = context;

    // navigate 
    const navigate = useNavigate();

    // User Login State 
    const [userLogin, setUserLogin] = useState({
        email: "",
        password: ""
    });

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);

    // State for forgot password email
    const [resetEmail, setResetEmail] = useState("");

    // State for showing/hiding forgot password form
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // Magic link states
    const [showMagicLink, setShowMagicLink] = useState(false);
    const [magicLinkEmail, setMagicLinkEmail] = useState("");
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const dispatch = useDispatch();

    // Complete sign-in if this page was opened from a magic link
    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            const email = localStorage.getItem('emailForSignIn')
                || window.prompt('Please enter your email to confirm sign-in');
            if (email) completeEmailLinkSignIn(email);
        }
    }, []);

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Auto login functions
    const handleAutoLoginUser = async () => {
        setLoading(true);
        try {
            const users = await signInWithEmailAndPassword(auth, "user@mail.ml", "user12345!");
            const q = query(
                collection(fireDB, "user"),
                where('uid', '==', users?.user?.uid)
            );
            const data = onSnapshot(q, (QuerySnapshot) => {
                let user;
                QuerySnapshot.forEach((doc) => user = doc.data());
                localStorage.setItem("users", JSON.stringify(user));
                toast.success("Login Successfully");
                setLoading(false);
                if (user.role === "user") {
                    navigate('/user-dashboard');
                }
            });
            return () => data;
        } catch (error) {
            setLoading(false);
            toast.error("Login Failed");
        }
    };

    const handleAutoLoginAdmin = async () => {
        setLoading(true);
        try {
            const users = await signInWithEmailAndPassword(auth, "admin@mail.ml", "admin12345!");
            const q = query(
                collection(fireDB, "user"),
                where('uid', '==', users?.user?.uid)
            );
            const data = onSnapshot(q, (QuerySnapshot) => {
                let user;
                QuerySnapshot.forEach((doc) => user = doc.data());
                localStorage.setItem("users", JSON.stringify(user));
                toast.success("Login Successfully");
                setLoading(false);
                if (user.role === "admin") {
                    navigate('/admin-dashboard');
                }
            });
            return () => data;
        } catch (error) {
            setLoading(false);
            toast.error("Login Failed");
        }
    };

    const completeEmailLinkSignIn = async (email) => {
        setLoading(true);
        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            localStorage.removeItem('emailForSignIn');
            window.history.replaceState({}, document.title, '/login');

            const q = query(collection(fireDB, "user"), where('uid', '==', result.user.uid));
            const unsub = onSnapshot(q, (snap) => {
                let user;
                snap.forEach((doc) => user = doc.data());
                if (user) {
                    localStorage.setItem("users", JSON.stringify(user));
                    toast.success("Login Successfully");
                    setLoading(false);
                    navigate(user.role === "admin" ? '/admin-dashboard' : '/user-dashboard');
                } else {
                    setLoading(false);
                    toast.error("No account found. Please sign up first.");
                }
            });
            return () => unsub();
        } catch (error) {
            setLoading(false);
            toast.error("Magic link sign-in failed. Please try again.");
        }
    };

    const handleSendMagicLink = async () => {
        if (!magicLinkEmail) {
            toast.error("Email is required");
            return;
        }
        setLoading(true);
        try {
            const actionCodeSettings = {
                url: window.location.origin + '/login',
                handleCodeInApp: true,
            };
            await sendSignInLinkToEmail(auth, magicLinkEmail, actionCodeSettings);
            localStorage.setItem('emailForSignIn', magicLinkEmail);
            setMagicLinkSent(true);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Magic link error:", error.code, error.message);
            toast.error(error.message || "Failed to send magic link. Please try again.");
        }
    };

    /**========================================================================
     *                          User Login Function
    *========================================================================**/

    const userLoginFunction = async () => {
        // validation 
        if (userLogin.email === "" || userLogin.password === "") {
            toast.error("All Fields are required");
            return;
        }

        setLoading(true);
        try {
            const users = await signInWithEmailAndPassword(auth, userLogin.email, userLogin.password);

            try {
                const q = query(
                    collection(fireDB, "user"),
                    where('uid', '==', users?.user?.uid)
                );
                const data = onSnapshot(q, (QuerySnapshot) => {
                    let user;
                    QuerySnapshot.forEach((doc) => user = doc.data());
                    localStorage.setItem("users", JSON.stringify(user));
                    setUserLogin({
                        email: "",
                        password: ""
                    });
                    toast.success("Login Successfully");
                    setLoading(false);
                    if (user.role === "user") {
                        navigate('/user-dashboard');
                    } else {
                        navigate('/admin-dashboard');
                    }
                });
                return () => data;
            } catch (error) {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error("Login Failed");
        }
    };

    const handlePasswordReset = async () => {
        if (resetEmail === "") {
            toast.error("Email is required");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            toast.success("Password reset email sent");
            setLoading(false);
            setShowForgotPassword(false);
            setResetEmail("");
        } catch (error) {
            setLoading(false);
            toast.error("Failed to send password reset email");
        }
    };

    const handleLogin = async () => {
        try {            
            // After successful login, load the user's cart
            const userId = auth.currentUser.uid;
            const storedCart = localStorage.getItem(`cart_${userId}`);
            if (storedCart) {
                const parsedCart = JSON.parse(storedCart);
                parsedCart.forEach(item => {
                    dispatch(addToCart(item));
                });
            }
        
        } catch (error) {
          
        }
    };

    return (
        <div className='bg-image'>
            {loading && <Loader />}
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                    px: 2,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        maxWidth: '500px',
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            px: 4,
                            py: 4,
                            textAlign: 'center',
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontFamily: "'Poppins', sans-serif",
                                mb: 1
                            }}
                        >
                            {showForgotPassword ? "Reset Password" : showMagicLink ? "Magic Link Login" : "Welcome Back"}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                opacity: 0.95,
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            {showForgotPassword ? "Enter your email to reset password" : showMagicLink ? "We'll send a sign-in link to your email" : "Login to your account"}
                        </Typography>
                    </Box>

                    <Box sx={{ px: 4, py: 4 }}>
                        {showMagicLink ? (
                            <Box component="form">
                                {magicLinkSent ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <AutoFixHighIcon sx={{ fontSize: 56, color: '#667eea', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                            Check your inbox!
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                                            We sent a sign-in link to <strong>{magicLinkEmail}</strong>. Click it to log in instantly — no password needed.
                                        </Typography>
                                        <Button
                                            variant="text"
                                            onClick={() => { setMagicLinkSent(false); setMagicLinkEmail(""); setShowMagicLink(false); }}
                                            sx={{ color: '#667eea', fontWeight: 600, textTransform: 'none' }}
                                        >
                                            Back to Login
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            placeholder="Enter your email"
                                            type="email"
                                            value={magicLinkEmail}
                                            onChange={(e) => setMagicLinkEmail(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon sx={{ color: '#667eea' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 3,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                                            }}
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            endIcon={<SendIcon />}
                                            onClick={handleSendMagicLink}
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                py: 1.5,
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '16px',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                                mb: 2,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                                }
                                            }}
                                        >
                                            Send Magic Link
                                        </Button>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                Prefer a password?{' '}
                                                <span
                                                    onClick={() => setShowMagicLink(false)}
                                                    style={{ color: '#667eea', cursor: 'pointer', fontWeight: 600 }}
                                                >
                                                    Login
                                                </span>
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        ) : showForgotPassword ? (
                            <Box component="form">
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: '#667eea' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#667eea',
                                        }
                                    }}
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    endIcon={<LockResetIcon />}
                                    onClick={handlePasswordReset}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                        mb: 2,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                        }
                                    }}
                                >
                                    Send Reset Link
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Remember your password?{' '}
                                        <span 
                                            onClick={() => setShowForgotPassword(false)}
                                            style={{ 
                                                color: '#667eea', 
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            Login
                                        </span>
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box component="form">
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={userLogin.email}
                                    onChange={(e) => {
                                        setUserLogin({
                                            ...userLogin,
                                            email: e.target.value
                                        });
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: '#667eea' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#667eea',
                                        }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Password"
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    value={userLogin.password}
                                    onChange={(e) => {
                                        setUserLogin({
                                            ...userLogin,
                                            password: e.target.value
                                        });
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: '#667eea' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#667eea',
                                        }
                                    }}
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    endIcon={<LoginIcon />}
                                    onClick={userLoginFunction}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                        mb: 3,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                        }
                                    }}
                                >
                                    Login
                                </Button>

                                {/* Auto Login Buttons */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="medium"
                                        startIcon={<PersonIcon />}
                                        onClick={handleAutoLoginUser}
                                        sx={{
                                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                            color: 'white',
                                            py: 1.2,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                boxShadow: '0 6px 16px rgba(74, 222, 128, 0.4)',
                                            }
                                        }}
                                    >
                                        User
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="medium"
                                        startIcon={<AdminPanelSettingsIcon />}
                                        onClick={handleAutoLoginAdmin}
                                        sx={{
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            py: 1.2,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #e47fe9 0%, #e04055 100%)',
                                                boxShadow: '0 6px 16px rgba(240, 147, 251, 0.4)',
                                            }
                                        }}
                                    >
                                        Admin
                                    </Button>
                                </Box>

                                <Box sx={{ textAlign: 'center', mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Forgot your password?{' '}
                                        <span
                                            onClick={() => setShowForgotPassword(true)}
                                            style={{ color: '#667eea', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Reset Password
                                        </span>
                                    </Typography>
                                </Box>

                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        No password?{' '}
                                        <span
                                            onClick={() => setShowMagicLink(true)}
                                            style={{ color: '#667eea', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Send me a magic link ✨
                                        </span>
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Don't have an account?{' '}
                                        <Link 
                                            to="/signup" 
                                            style={{ 
                                                color: '#667eea', 
                                                textDecoration: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            Signup
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
        </div>
    );
};

export default Login;
