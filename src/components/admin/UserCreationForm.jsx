import { createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { auth, fireDB } from "../../firebase/FirebaseConfig";
import { Toaster } from 'react-hot-toast';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CakeIcon from '@mui/icons-material/Cake';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 

const countryList = [
  "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium",
  "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece",
  "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia",
  "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco",
  "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal",
  "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain",
  "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican City"
];

const UserCreationForm = () => {
  const { loading, setLoading } = useContext(myContext);

  const [userSignup, setUserSignup] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    country: "",
    profession: "",
    role: "user",
  });

  const showCustomToast = (type, message) => {
    toast.custom(
      (t) => (
        <CustomToast
          type={type}
          message={message}
          onClose={() => {
            toast.dismiss(t.id);
          }}
        />
      ),
      {
        duration: 1500,
        position: 'bottom-center',
        id: `${type}-${Date.now()}`,
      }
    );
  };

  const userSignupFunction = async () => {
    // More strict email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(userSignup.email)) {
      showCustomToast('error', 'Your email address is invalid');
      return;
    }

    // Validate password length
    if (userSignup.password.length < 6) {
      showCustomToast('error', 'Password must be at least 6 characters long');
      return;
    }

    // Validate all fields are filled
    if (Object.values(userSignup).some(value => value === "")) {
      showCustomToast('error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userSignup.email,
        userSignup.password
      );

      // Create user document in Firestore
      const user = {
        name: userSignup.name.trim(),
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        dateOfBirth: userSignup.dateOfBirth,
        country: userSignup.country,
        profession: userSignup.profession.trim(),
        role: userSignup.role,
        createdAt: Timestamp.now(),
        lastEditedAt: Timestamp.now(),
        createdDate: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        lastEditedDate: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status: true
      };

      // Add to Firestore
      await addDoc(collection(fireDB, "user"), user);

      // Reset form
      setUserSignup({
        name: "",
        email: "",
        password: "",
        dateOfBirth: "",
        country: "",
        profession: "",
        role: "user",
      });

      showCustomToast('success', 'Your account has been saved');
    } catch (error) {
      
      let errorMessage;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Your email address is invalid';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = 'Failed to create user. Please try again.';
      }
      
      showCustomToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1500,
        }}
      />
      
      <Box sx={{ maxWidth: '600px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 4,
            py: 3,
            mb: 4,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            textAlign: 'center',
          }}
        >
          <PersonAddIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontFamily: "'Poppins', sans-serif",
              mb: 0.5
            }}
          >
            Create New Account
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.95,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Add a new user to the system
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Loader />
          </Box>
        )}

        {/* Form */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <Grid container spacing={3}>
            {/* Full Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Enter full name"
                value={userSignup.name}
                onChange={(e) => setUserSignup({ ...userSignup, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <PersonAddIcon sx={{ color: '#667eea', mr: 1 }} />
                  ),
                }}
                sx={{
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
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                placeholder="Enter email address"
                value={userSignup.email}
                onChange={(e) => setUserSignup({ ...userSignup, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ color: '#667eea', mr: 1 }} />
                  ),
                }}
                sx={{
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
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                placeholder="Enter password (min 6 characters)"
                value={userSignup.password}
                onChange={(e) => setUserSignup({ ...userSignup, password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ color: '#667eea', mr: 1 }} />
                  ),
                }}
                sx={{
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
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={userSignup.dateOfBirth}
                onChange={(e) => setUserSignup({ ...userSignup, dateOfBirth: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <CakeIcon sx={{ color: '#667eea', mr: 1 }} />
                  ),
                }}
                sx={{
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
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    '&.Mui-focused': {
                      color: '#667eea',
                    }
                  }}
                >
                  Country
                </InputLabel>
                <Select
                  value={userSignup.country}
                  label="Country"
                  onChange={(e) => setUserSignup({ ...userSignup, country: e.target.value })}
                  startAdornment={
                    <PublicIcon sx={{ color: '#667eea', mr: 1, ml: 1 }} />
                  }
                  sx={{
                    borderRadius: '12px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    }
                  }}
                >
                  <MenuItem value="">Select Country</MenuItem>
                  {countryList.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Profession */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profession"
                placeholder="Enter profession"
                value={userSignup.profession}
                onChange={(e) => setUserSignup({ ...userSignup, profession: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <WorkIcon sx={{ color: '#667eea', mr: 1 }} />
                  ),
                }}
                sx={{
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
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    '&.Mui-focused': {
                      color: '#667eea',
                    }
                  }}
                >
                  Role
                </InputLabel>
                <Select
                  value={userSignup.role}
                  label="Role"
                  onChange={(e) => setUserSignup({ ...userSignup, role: e.target.value })}
                  startAdornment={
                    <AdminPanelSettingsIcon sx={{ color: '#667eea', mr: 1, ml: 1 }} />
                  }
                  sx={{
                    borderRadius: '12px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    }
                  }}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={userSignupFunction}
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
                Create Account
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserCreationForm;