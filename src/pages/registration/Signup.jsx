import React, { useContext, useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    MenuItem,
    Divider,
    Card,
    CardContent,
} from "@mui/material";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { auth, fireDB } from "../../firebase/FirebaseConfig";
import './Signup.css';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

  const countryList = [
    { name: "Albania" },
    { name: "Andorra" },
    { name: "Armenia" },
    { name: "Austria" },
    { name: "Azerbaijan" },
    { name: "Belarus" },
    { name: "Belgium" },
    { name: "Bosnia and Herzegovina" },
    { name: "Bulgaria" },
    { name: "Croatia" },
    { name: "Cyprus" },
    { name: "Czech Republic" },
    { name: "Denmark" },
    { name: "Estonia" },
    { name: "Finland" },
    { name: "France" },
    { name: "Georgia" },
    { name: "Germany" },
    { name: "Greece" },
    { name: "Hungary" },
    { name: "Iceland" },
    { name: "Ireland" },
    { name: "Italy" },
    { name: "Kazakhstan" },
    { name: "Kosovo" },
    { name: "Latvia" },
    { name: "Liechtenstein" },
    { name: "Lithuania" },
    { name: "Luxembourg" },
    { name: "Malta" },
    { name: "Moldova" },
    { name: "Monaco" },
    { name: "Montenegro" },
    { name: "Netherlands" },
    { name: "North Macedonia" },
    { name: "Norway" },
    { name: "Poland" },
    { name: "Portugal" },
    { name: "Romania" },
    { name: "Russia" },
    { name: "San Marino" },
    { name: "Serbia" },
    { name: "Slovakia" },
    { name: "Slovenia" },
    { name: "Spain" },
    { name: "Sweden" },
    { name: "Switzerland" },
    { name: "Turkey" },
    { name: "Ukraine" },
    { name: "United Kingdom" },
    { name: "Vatican City" }
  ];

  // Add email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const Signup = () => {
    const context = useContext(myContext);
    const { loading, setLoading } = context;
    const navigate = useNavigate();

    const [userSignup, setUserSignup] = useState({
        name: "",
        email: "",
        password: "",
        dateOfBirth: "",
        country: "",
        profession: "",
        role: "user"
    });

    const [errors, setErrors] = useState({
        name: false,
        email: false,
        password: false,
        dateOfBirth: false,
        country: false,
        profession: false,
    });

    const [step, setStep] = useState(1); // Track the current step

    // Revalidate the form when a field is updated
    const handleChange = (e, { name, value }) => {
        setUserSignup({ ...userSignup, [name]: value });
        
        // Revalidate the specific field
        setErrors({ ...errors, [name]: value === "" });
    };

    const nextStep = () => {
        if (step === 1) {
            const newErrors = {
                name: userSignup.name === "",
                email: userSignup.email === "" || !isValidEmail(userSignup.email),
                password: userSignup.password === "" || userSignup.password.length < 6
            };
            setErrors(newErrors);
            
            // Add specific error messages
            if (userSignup.email && !isValidEmail(userSignup.email)) {
                toast.error("Please enter a valid email address");
                return;
            }
            if (userSignup.password && userSignup.password.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return;
            }
            
            if (!Object.values(newErrors).includes(true)) {
                setStep(step + 1);
            }
        } else if (step === 2) {
            const newErrors = {
                dateOfBirth: userSignup.dateOfBirth === "",
                country: userSignup.country === "",
                profession: userSignup.profession === ""
            };
            setErrors(newErrors);
            if (!Object.values(newErrors).includes(true)) {
                setStep(step + 1);
            }
        }
    };

    const prevStep = () => setStep(step - 1);

    const userSignupFunction = async () => {
        if (
            userSignup.name === "" || 
            userSignup.email === "" || 
            userSignup.password === "" || 
            userSignup.dateOfBirth === "" || 
            userSignup.country === "" || 
            userSignup.profession === ""
        ) {
            toast.error("All fields are required");
            return;
        }

        if (!isValidEmail(userSignup.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const users = await createUserWithEmailAndPassword(auth, userSignup.email, userSignup.password);

            const user = {
                name: userSignup.name,
                email: users.user.email,
                uid: users.user.uid,
                dateOfBirth: userSignup.dateOfBirth,
                country: userSignup.country,
                profession: userSignup.profession,
                role: userSignup.role,
                time: Timestamp.now(),
                date: new Date().toLocaleString(
                    "en-US",
                    {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                    }
                )
            };

            const userReference = collection(fireDB, "user");
            await addDoc(userReference, user);

            setUserSignup({
                name: "",
                email: "",
                password: "",
                dateOfBirth: "",
                country: "",
                profession: ""
            });

            toast.success("Signup Successfully");
            setLoading(false);
            navigate('/login');
        } catch (error) {
            setLoading(false);
            toast.error("Signup failed. Please try again.");
        }
    };

    return (
        <div className='signup-bg'>
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
                        maxWidth: '700px',
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
                            Create Account
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                opacity: 0.95,
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            Join us today and start shopping
                        </Typography>
                    </Box>

                    <Box sx={{ px: 4, py: 4 }}>
                        {/* Stepper */}
                        <Stepper 
                            activeStep={step - 1} 
                            sx={{ 
                                mb: 4,
                                '& .MuiStepLabel-root .Mui-completed': {
                                    color: '#667eea',
                                },
                                '& .MuiStepLabel-root .Mui-active': {
                                    color: '#667eea',
                                },
                            }}
                        >
                            <Step>
                                <StepLabel>Account</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Personal</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Review</StepLabel>
                            </Step>
                        </Stepper>

                        {/* Step 1: Account Details */}
                        {step === 1 && (
                            <Box component="form">
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    name="name"
                                    value={userSignup.name}
                                    onChange={(e) => handleChange(e, { name: 'name', value: e.target.value })}
                                    error={errors.name}
                                    helperText={errors.name && 'Name is required'}
                                    InputProps={{
                                        startAdornment: <PersonIcon sx={{ mr: 1, color: '#667eea' }} />,
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
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    name="email"
                                    type="email"
                                    value={userSignup.email}
                                    onChange={(e) => handleChange(e, { name: 'email', value: e.target.value })}
                                    error={errors.email}
                                    helperText={errors.email && 'Valid email is required'}
                                    InputProps={{
                                        startAdornment: <EmailIcon sx={{ mr: 1, color: '#667eea' }} />,
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
                                    name="password"
                                    type="password"
                                    value={userSignup.password}
                                    onChange={(e) => handleChange(e, { name: 'password', value: e.target.value })}
                                    error={errors.password}
                                    helperText={errors.password && 'Password must be at least 6 characters'}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 1, color: '#667eea' }} />,
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
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={nextStep}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                        }
                                    }}
                                >
                                    Next
                                </Button>
                            </Box>
                        )}

                        {/* Step 2: Personal Details */}
                        {step === 2 && (
                            <Box component="form">
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={userSignup.dateOfBirth}
                                    onChange={(e) => handleChange(e, { name: 'dateOfBirth', value: e.target.value })}
                                    error={errors.dateOfBirth}
                                    helperText={errors.dateOfBirth && 'Date of birth is required'}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: '#667eea' }} />,
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
                                    select
                                    label="Country"
                                    name="country"
                                    value={userSignup.country}
                                    onChange={(e) => handleChange(e, { name: 'country', value: e.target.value })}
                                    error={errors.country}
                                    helperText={errors.country && 'Country is required'}
                                    InputProps={{
                                        startAdornment: <PublicIcon sx={{ mr: 1, color: '#667eea' }} />,
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
                                >
                                    {countryList.map((country) => (
                                        <MenuItem key={country.name} value={country.name}>
                                            {country.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    label="Profession"
                                    placeholder="Enter your profession"
                                    name="profession"
                                    value={userSignup.profession}
                                    onChange={(e) => handleChange(e, { name: 'profession', value: e.target.value })}
                                    error={errors.profession}
                                    helperText={errors.profession && 'Profession is required'}
                                    InputProps={{
                                        startAdornment: <WorkIcon sx={{ mr: 1, color: '#667eea' }} />,
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

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="large"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={prevStep}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            borderColor: 'rgba(102, 126, 234, 0.3)',
                                            color: '#667eea',
                                            '&:hover': {
                                                borderColor: '#667eea',
                                                bgcolor: 'rgba(102, 126, 234, 0.05)',
                                            }
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={nextStep}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            py: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                                            }
                                        }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <Box>
                                <Card
                                    elevation={0}
                                    sx={{
                                        mb: 3,
                                        borderRadius: '16px',
                                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                                        border: '1px solid rgba(102, 126, 234, 0.1)',
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                mb: 3, 
                                                fontWeight: 700,
                                                color: '#667eea',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <CheckCircleIcon />
                                            Review Your Details
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <PersonIcon sx={{ color: '#667eea' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Full Name
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {userSignup.name}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <EmailIcon sx={{ color: '#667eea' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Email Address
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {userSignup.email}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <CalendarTodayIcon sx={{ color: '#667eea' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Date of Birth
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {userSignup.dateOfBirth}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <PublicIcon sx={{ color: '#667eea' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Country
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {userSignup.country}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <WorkIcon sx={{ color: '#667eea' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Profession
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {userSignup.profession}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="large"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={prevStep}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            borderColor: 'rgba(102, 126, 234, 0.3)',
                                            color: '#667eea',
                                            '&:hover': {
                                                borderColor: '#667eea',
                                                bgcolor: 'rgba(102, 126, 234, 0.05)',
                                            }
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        endIcon={<CheckCircleIcon />}
                                        onClick={userSignupFunction}
                                        sx={{
                                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                            color: 'white',
                                            py: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            boxShadow: '0 4px 12px rgba(74, 222, 128, 0.4)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                boxShadow: '0 6px 16px rgba(74, 222, 128, 0.5)',
                                            }
                                        }}
                                    >
                                        Create Account
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    style={{ 
                                        color: '#667eea', 
                                        textDecoration: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Login here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </div>
    );
}

export default Signup;
