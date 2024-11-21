import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import myContext from '../../../context/myContext';
import Layout from '../../../components/layout/Layout';
import { FiSearch } from 'react-icons/fi';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';
import toast from 'react-hot-toast';
import './faq.css';
function FAQ() {
  const context = useContext(myContext);
  const { faqs } = context;
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAskForm, setShowAskForm] = useState(false);
  const [question, setQuestion] = useState({
    email: '',
    subject: '',
    message: ''
  });

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(fireDB, "questions"), {
        ...question,
        status: 'pending',
        time: Timestamp.now()
      });
      toast.success("Question submitted successfully!");
      setQuestion({ email: '', subject: '', message: '' });
      setShowAskForm(false);
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Failed to submit question");
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Top questions about Our Store</h1>
          <p className="text-xl mb-8">
            Need something cleared up? Here are our most frequently asked questions.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`button px-4 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-[rgb(231,80,206)] text-white active:bg-blue-500'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            {['general', 'pricing', 'technical', 'account'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`button px-4 rounded-full capitalize ${
                  selectedCategory === category
                    ? 'bg-[rgb(231,80,206)] text-white active:bg-blue-500'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="grid gap-8">
          {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
              <div className="space-y-4">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Ask a Question Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowAskForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Can't find what you're looking for? Ask us!
          </button>
        </div>

        {/* Question Form Modal */}
        {showAskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
              <form onSubmit={handleSubmitQuestion}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={question.email}
                    onChange={(e) => setQuestion({...question, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={question.subject}
                    onChange={(e) => setQuestion({...question, subject: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Question</label>
                  <textarea
                    required
                    value={question.message}
                    onChange={(e) => setQuestion({...question, message: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                    rows="4"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAskForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Submit Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No FAQs found matching your search. Please try a different search term or ask us your question!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default FAQ;
