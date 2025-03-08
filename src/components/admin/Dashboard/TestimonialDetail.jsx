import React, { useContext, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Grid, Avatar } from '@mui/material';
import MyContext from "../../../context/myContext";
import Loader from "../../loader/Loader";

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">All Testimonials</h1>
        <p className="text-gray-500">Manage your testimonials here.</p>
      </div>

      <div className="flex justify-center relative top-20">
        {loading && <Loader />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <Avatar src={testimonial.photoURL} alt={testimonial.name} />
              <div className="ml-3">
                <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                <p className="text-gray-500">{testimonial.time}</p>
              </div>
            </div>
            <p className="text-gray-700">{testimonial.comment}</p>
            <div className="flex justify-end mt-4">
              <IconButton onClick={() => handleDelete(testimonial.id)}>
                <DeleteIcon style={{ color: 'red' }} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialDetail;
