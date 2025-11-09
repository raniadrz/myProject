import React, { useContext, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Grid, 
  Avatar,
  Paper,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button
} from '@mui/material';
import MyContext from "../../../context/myContext";
import Loader from "../../loader/Loader";
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';

const TestimonialDetail = () => {
  const context = useContext(MyContext);
  const { loading, testimonials, deleteTestimonial } = context;

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const handleClickOpenDetailDialog = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedTestimonial(null);
  };

  const handleDelete = async (testimonialId) => {
    try {
      await deleteTestimonial(testimonialId);
      handleCloseDetailDialog();
    } catch (error) {
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
    return date.toLocaleString('en-GB');
  };

  const rows = testimonials.map((testimonial, index) => ({
    id: testimonial.id,
    serial: index + 1,
    name: testimonial.name || "N/A",
    comment: testimonial.comment || "N/A",
    time: formatTimestamp(testimonial.time),
    photoURL: testimonial.photoURL || "", // Add this for rendering the avatar
    testimonial, // Pass full testimonial object for dialog
  }));

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          px: 4,
          py: 4,
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 0.5,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          All Testimonials
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            opacity: 0.95,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Manage your customer testimonials and reviews
        </Typography>
      </Box>

      {/* Stats Card */}
      <Box sx={{ mb: 4 }}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: '16px',
            maxWidth: '300px',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Testimonials
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {testimonials.length}
                </Typography>
              </Box>
              <CommentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Loader />
        </Box>
      )}

      {/* Testimonials Grid */}
      <Grid container spacing={3}>
        {rows.map((testimonial) => (
          <Grid item xs={12} sm={6} md={4} key={testimonial.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 28px rgba(102, 126, 234, 0.15)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* User Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={testimonial.photoURL} 
                    alt={testimonial.name}
                    sx={{
                      width: 56,
                      height: 56,
                      border: '3px solid',
                      borderColor: 'rgba(102, 126, 234, 0.2)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {testimonial.name?.[0]}
                  </Avatar>
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#1a1a1a',
                        mb: 0.5
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          sx={{ 
                            fontSize: 16, 
                            color: '#fbbf24' 
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Comment */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    lineHeight: 1.6,
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  "{testimonial.comment}"
                </Typography>

                {/* Date Chip */}
                <Chip 
                  label={testimonial.time}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '8px'
                  }}
                />
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                <IconButton 
                  onClick={() => handleDelete(testimonial.id)}
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {rows.length === 0 && !loading && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 8,
            textAlign: 'center',
            borderRadius: '16px',
            border: '2px dashed rgba(102, 126, 234, 0.2)'
          }}
        >
          <CommentIcon sx={{ fontSize: 64, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
            No testimonials yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Customer testimonials will appear here once they're submitted
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TestimonialDetail;
