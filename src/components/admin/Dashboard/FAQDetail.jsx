import React, { useState, useContext } from 'react';
import myContext from '../../../context/myContext';
import { FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { updateDoc, doc, deleteDoc, collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function FAQDetail() {
  const context = useContext(myContext);
  const { loading, faqs, questions, setQuestions } = context;
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('faqs');
  const [currentItem, setCurrentItem] = useState({
    question: '',
    answer: '',
    category: 'general',
    type: 'faq'
  });

  // Filter FAQs and use questions directly
  const adminFaqs = faqs.filter(item => item.type === 'faq');

  const handleReply = async (question) => {
    setCurrentItem({
      ...question,
      type: 'question',
      answer: question.answer || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentItem.type === 'question') {
        // Handle question reply
        const questionRef = doc(fireDB, "questions", currentItem.id);
        const updateData = {
          ...currentItem,
          status: 'answered',
          answeredAt: Timestamp.now()
        };

        await updateDoc(questionRef, updateData);

        if (e.target.addToFaq?.checked) {
          await context.addFAQ({
            question: currentItem.message || currentItem.subject,
            answer: currentItem.answer,
            category: currentItem.category || 'general',
            type: 'faq'
          });
        }

        setQuestions(questions.map(q => 
          q.id === currentItem.id ? { ...q, ...updateData } : q
        ));

        toast.success("Question answered successfully");

        // Open email app to notify the user
        openEmailApp(currentItem.email, currentItem.answer);
      } else if (editMode) {
        // Handle FAQ edit
        await context.updateFAQ(currentItem.id, {
          question: currentItem.question,
          answer: currentItem.answer,
          category: currentItem.category,
          type: 'faq'
        });
        toast.success("FAQ updated successfully");

        // Send second email notification after FAQ update
        openEmailApp(currentItem.email, currentItem.answer, true);
      } else {
        // Handle new FAQ
        await context.addFAQ({
          question: currentItem.question,
          answer: currentItem.answer,
          category: currentItem.category,
          type: 'faq'
        });
        toast.success("FAQ added successfully");
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const resetForm = () => {
    setCurrentItem({
      question: '',
      answer: '',
      category: 'general',
      type: 'faq'
    });
    setEditMode(false);
  };

  const openEmailApp = (userEmail, answer, isEdit = false) => {
    const subject = isEdit ? encodeURIComponent('Your question has been updated 🩵') : encodeURIComponent('Your Question has been Answered 🩵');
    const body = isEdit 
      ? encodeURIComponent(`Dear Customer,\n\nYour question has been updated: ${answer}\n\nKind Regards,\nTeam Pet Paradise 🩵`) 
      : encodeURIComponent(`Dear Customer,\n\nYour question has been answered: ${answer}\n\nKind Regards,\nTeam Pet Paradise 🩵`);
    window.open(`mailto:${userEmail}?subject=${subject}&body=${body}`);
  };

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
          FAQ Management
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            opacity: 0.95,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Manage frequently asked questions and user inquiries
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '16px',
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
                  Total FAQs
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {adminFaqs.length}
                </Typography>
              </Box>
              <QuestionAnswerIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '16px',
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
                  User Questions
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {questions.length}
                </Typography>
                <Chip 
                  label={`${questions.filter(q => q.status !== 'answered').length} pending`}
                  size="small"
                  sx={{ 
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              <HelpOutlineIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          mb: 3
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: '2px solid #f0f0f0',
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              minHeight: '60px',
              color: '#666',
              '&.Mui-selected': {
                color: '#667eea',
              }
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '3px',
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Tab 
            value="faqs" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuestionAnswerIcon sx={{ fontSize: 20 }} />
                <span>FAQs ({adminFaqs.length})</span>
              </Box>
            }
          />
          <Tab 
            value="questions" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutlineIcon sx={{ fontSize: 20 }} />
                <span>User Questions ({questions.length})</span>
                {questions.filter(q => q.status !== 'answered').length > 0 && (
                  <Chip 
                    label={questions.filter(q => q.status !== 'answered').length}
                    size="small"
                    sx={{ 
                      bgcolor: '#ff5252',
                      color: 'white',
                      height: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* FAQs Table */}
      {activeTab === 'faqs' && (
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              Add New FAQ
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px', width: '25%' }}>
                    Question
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px', width: '50%' }}>
                    Answer
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px', width: '12.5%' }}>
                    Category
                  </th>
                  <th style={{ textAlign: 'center', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px', width: '12.5%' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminFaqs.length > 0 ? (
                  adminFaqs.map((faq) => (
                    <tr 
                      key={faq.id} 
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {faq.question}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {faq.answer}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Chip 
                          label={faq.category}
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '8px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => {
                              setCurrentItem(faq);
                              setEditMode(true);
                              setShowModal(true);
                            }}
                            sx={{
                              color: '#667eea',
                              '&:hover': {
                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                              }
                            }}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={async () => {
                              try {
                                await deleteDoc(doc(fireDB, "faqs", faq.id));
                                toast.success("FAQ deleted successfully");
                              } catch (error) {
                                toast.error("Failed to delete FAQ");
                              }
                            }}
                            sx={{
                              color: '#ef4444',
                              '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                              }
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#999' }}>
                        No FAQs found
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Questions Table */}
      {activeTab === 'questions' && (
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                    Email
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                    Subject
                  </th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                    Message
                  </th>
                  <th style={{ textAlign: 'center', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'center', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {questions.length > 0 ? (
                  questions.map((question) => (
                    <tr 
                      key={question.id} 
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {question.email}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {question.subject}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {question.message}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Chip 
                          label={question.status || 'pending'}
                          size="small"
                          sx={{ 
                            background: question.status === 'answered' 
                              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '8px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <IconButton
                          onClick={() => handleReply(question)}
                          disabled={question.status === 'answered'}
                          sx={{
                            color: question.status === 'answered' ? '#ccc' : '#667eea',
                            '&:hover': {
                              bgcolor: question.status === 'answered' ? 'transparent' : 'rgba(102, 126, 234, 0.1)',
                            },
                            '&:disabled': {
                              color: '#ccc',
                            }
                          }}
                          size="small"
                        >
                          <ReplyIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#999' }}>
                        No questions found
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '20px',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {editMode ? 'Reply to Question' : 'Add New FAQ'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, mt: 2 }}>
            {editMode && currentItem.type === 'question' ? (
              <>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: '12px' }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    <strong>From:</strong> {currentItem.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    <strong>Subject:</strong> {currentItem.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Question:</strong> {currentItem.message}
                  </Typography>
                </Box>
                
                <TextField
                  label="Your Reply"
                  value={currentItem.answer}
                  onChange={(e) => setCurrentItem({ ...currentItem, answer: e.target.value })}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    }
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      name="addToFaq"
                      sx={{
                        color: '#667eea',
                        '&.Mui-checked': {
                          color: '#667eea',
                        }
                      }}
                    />
                  }
                  label="Add this Q&A to the FAQ section"
                />
              </>
            ) : (
              <>
                <TextField
                  label="Question"
                  value={currentItem.question}
                  onChange={(e) => setCurrentItem({ ...currentItem, question: e.target.value })}
                  fullWidth
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
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
                  label="Answer"
                  value={currentItem.answer}
                  onChange={(e) => setCurrentItem({ ...currentItem, answer: e.target.value })}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    }
                  }}
                />
                
                <FormControl 
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#667eea',
                    }
                  }}
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={currentItem.category}
                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="pricing">Pricing</MenuItem>
                    <MenuItem value="technical">Technical</MenuItem>
                    <MenuItem value="account">Account</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setShowModal(false)}
              sx={{
                textTransform: 'none',
                color: '#666',
                borderRadius: '12px',
                px: 3,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                px: 3,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              {editMode ? 'Send Reply' : 'Add FAQ'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default FAQDetail;