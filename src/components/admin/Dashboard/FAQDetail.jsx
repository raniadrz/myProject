import React, { useState, useContext } from 'react';
import myContext from '../../../context/myContext';
import { FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { updateDoc, doc, deleteDoc, collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';
import toast from 'react-hot-toast';
import './FAQDetail.css';

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
      } else if (editMode) {
        // Handle FAQ edit
        await context.updateFAQ(currentItem.id, {
          question: currentItem.question,
          answer: currentItem.answer,
          category: currentItem.category,
          type: 'faq'
        });
        toast.success("FAQ updated successfully");
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

  return (
    <div className="w-full px-4">
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`tab-button ${activeTab === 'faqs' ? 'active' : 'inactive'}`}
            >
              FAQs ({adminFaqs.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`tab-button ${activeTab === 'questions' ? 'active' : 'inactive'}`}
            >
              User Questions ({questions.length})
            </button>
          </nav>
        </div>
      </div>

      {/* FAQs Table */}
      {activeTab === 'faqs' && (
        <>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add New FAQ
          </button>

          <div className="w-full overflow-x-auto">
            <table className="faq-table">
              <thead>
                <tr>
                  <th className="table-header w-1/4">Question</th>
                  <th className="table-header w-1/2">Answer</th>
                  <th className="table-header w-1/8">Category</th>
                  <th className="table-header w-1/8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminFaqs.length > 0 ? (
                  adminFaqs.map((faq) => (
                    <tr key={faq.id} className="table-row">
                      <td className="table-cell">{faq.question}</td>
                      <td className="table-cell">{faq.answer}</td>
                      <td className="table-cell">{faq.category}</td>
                      <td className="table-cell">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setCurrentItem(faq);
                              setEditMode(true);
                              setShowModal(true);
                            }}
                            className="action-button edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await deleteDoc(doc(fireDB, "faqs", faq.id));
                                toast.success("FAQ deleted successfully");
                              } catch (error) {
                                toast.error("Failed to delete FAQ");
                              }
                            }}
                            className="action-button delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="table-cell text-center text-gray-500">
                      No FAQs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Questions Table */}
      {activeTab === 'questions' && (
        <div className="w-full overflow-x-auto">
          <table className="faq-table">
            <thead>
              <tr>
                <th className="table-header">Email</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Message</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length > 0 ? (
                questions.map((question) => (
                  <tr key={question.id} className="table-row">
                    <td className="table-cell">{question.email}</td>
                    <td className="table-cell">{question.subject}</td>
                    <td className="table-cell">{question.message}</td>
                    <td className="table-cell">
                      <span className={`status-badge ${question.status === 'answered' ? 'answered' : 'pending'}`}>
                        {question.status || 'pending'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleReply(question)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={question.status === 'answered'}
                      >
                        <FaReply />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="table-cell text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ marginTop: '12rem' }}>
              <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {editMode ? 'Reply to Question' : 'Add New FAQ'}
                </h3>

                {editMode && currentItem.type === 'question' ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        <strong>From:</strong> {currentItem.email}<br />
                        <strong>Subject:</strong> {currentItem.subject}<br />
                        <strong>Question:</strong> {currentItem.message}
                      </p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Reply
                      </label>
                      <textarea
                        value={currentItem.answer}
                        onChange={(e) => setCurrentItem({ ...currentItem, answer: e.target.value })}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="addToFaq"
                          className="rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Add this Q&A to the FAQ section
                        </span>
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={currentItem.question}
                        onChange={(e) => setCurrentItem({ ...currentItem, question: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer
                      </label>
                      <textarea
                        value={currentItem.answer}
                        onChange={(e) => setCurrentItem({ ...currentItem, answer: e.target.value })}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={currentItem.category}
                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="pricing">Pricing</option>
                        <option value="technical">Technical</option>
                        <option value="account">Account</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    {editMode ? 'Send Reply' : 'Add FAQ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FAQDetail;