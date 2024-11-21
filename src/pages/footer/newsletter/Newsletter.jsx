import React, { useState, useEffect } from 'react';
import './Newsletter.css';
import { fireDB } from '../../../firebase/FirebaseConfig';
import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import Layout from '../../../components/layout/Layout';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberDocId, setSubscriberDocId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        checkSubscriptionStatus(currentUser.email);
        setEmail(currentUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkSubscriptionStatus = async (userEmail) => {
    try {
      setEmail(userEmail);
      const q = query(
        collection(fireDB, "newsletter_subscribers"), 
        where("email", "==", userEmail),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setIsSubscribed(true);
        setSubscriberDocId(querySnapshot.docs[0].id);
      } else {
        setIsSubscribed(false);
        setSubscriberDocId(null);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const checkEmailSubscription = async (emailToCheck) => {
    try {
      const q = query(
        collection(fireDB, "newsletter_subscribers"), 
        where("email", "==", emailToCheck),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setIsSubscribed(true);
        setSubscriberDocId(querySnapshot.docs[0].id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking email subscription:", error);
      return false;
    }
  };

  const handleEmailChange = async (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      await checkEmailSubscription(newEmail);
    } else {
      setIsSubscribed(false);
      setSubscriberDocId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if email already exists and is active
      const q = query(
        collection(fireDB, "newsletter_subscribers"), 
        where("email", "==", email),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error('This email is already subscribed to the newsletter!');
        return;
      }

      // Check if email exists but is inactive
      const inactiveQ = query(
        collection(fireDB, "newsletter_subscribers"), 
        where("email", "==", email),
        where("active", "==", false)
      );
      const inactiveSnapshot = await getDocs(inactiveQ);

      if (!inactiveSnapshot.empty) {
        // Reactivate the subscription
        const docRef = doc(fireDB, "newsletter_subscribers", inactiveSnapshot.docs[0].id);
        await updateDoc(docRef, { 
          active: true,
          resubscribedAt: Timestamp.now()
        });
        setSubscriberDocId(inactiveSnapshot.docs[0].id);
      } else {
        // Create new subscription
        const subscriberData = {
          email: email,
          subscribedAt: Timestamp.now(),
          active: true,
          uid: user ? user.uid : null
        };
        const docRef = await addDoc(collection(fireDB, "newsletter_subscribers"), subscriberData);
        setSubscriberDocId(docRef.id);
      }
      
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      if (!subscriberDocId) {
        throw new Error('Subscription document ID not found');
      }

      const docRef = doc(fireDB, "newsletter_subscribers", subscriberDocId);
      await updateDoc(docRef, { 
        active: false,
        unsubscribedAt: Timestamp.now()
      });
      
      toast.success('Successfully unsubscribed from newsletter.');
      setIsSubscribed(false);
      setSubscriberDocId(null);
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      toast.error('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="newsletter-container">
      <div className="newsletter-content">
        <img 
          src="https://i.etsystatic.com/8863434/r/il/0769db/1655791069/il_1080xN.1655791069_s4e0.jpg" 
          alt="Newsletter Icon" 
          className="header-icon"
        />
        
        <h1>Join Our <span className="highlight">Pack</span></h1>
        <h2>Get tail-wagging updates straight to your inbox!</h2>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Your email address"
              required
              disabled={loading}
            />
            {isSubscribed ? (
              <button 
                type="button" 
                onClick={handleUnsubscribe} 
                disabled={loading}
                className="unsubscribe-button"
              >
                {loading ? 'Processing...' : 'Unsubscribe'}
              </button>
            ) : (
              <button type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Now'}
              </button>
            )}
          </form>
        </div>

        <div className="decorative-elements">
          <img 
            src="https://cdn.shopify.com/s/files/1/0718/0782/8246/products/sdn-3032_b.jpg?v=1693219419" 
            alt="Decorative Dog" 
            className="dog-image"
          />
          <span className="lightning-bolt">⚡</span>
          <span className="star-burst">✨</span>
        </div>

        <div className="bottom-section">
          
          <p>Join our community of happy pet parents!</p>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Newsletter;