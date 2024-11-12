import {
  createUserWithEmailAndPassword,
  deleteUser as fbDeleteUser,
  getAuth,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fireDB } from "../firebase/FirebaseConfig";
import MyContext from "./myContext";

// Add this function at the component level (outside the MyState component)
const calculateAverageRating = (testimonials) => {
    if (!testimonials?.length) return 0;
    const sum = testimonials.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (sum / testimonials.length).toFixed(1);
};

function MyState({ children }) {
  const [loading, setLoading] = useState(false);
  const [getAllProduct, setGetAllProduct] = useState([]);
  const [getAllOrder, setGetAllOrder] = useState([]);
  const [getAllUser, setGetAllUser] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
// Add Testimonial
const addTestimonial = async (testimonialData) => {
  setLoading(true);
  try {
    // Get current user from Firebase Auth
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    // Get user document from Firestore
    const userDocRef = doc(fireDB, "user", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    // Get the user's name with proper fallbacks
    let userName = userData?.name;  // First try to get name from Firestore
    if (!userName) {
      // If no name in Firestore, try getting from Auth
      userName = currentUser?.displayName;
    }
    if (!userName) {
      // If still no name, use email prefix
      userName = currentUser?.email?.split('@')[0];
    }

    const testimonialToSave = {
      name: testimonialData.isAnonymous ? 'Anonymous' : userName,
      comment: testimonialData.comment,
      rating: testimonialData.rating,
      email: currentUser?.email,
      uid: currentUser?.uid,
      isAnonymous: testimonialData.isAnonymous,
      photoURL: testimonialData.isAnonymous ? '' : (userData?.photoURL || currentUser?.photoURL || ''),
      time: Timestamp.now(),
      country: 'GR',
      role: userData?.role || 'user' // Include user role
    };
    

    console.log("Current user data:", {
      firestoreData: userData,
      authData: currentUser,
      finalName: userName
    });

    await addDoc(collection(fireDB, "testimonials"), testimonialToSave);
    toast.success("Testimonial added successfully");
    fetchTestimonials();
  } catch (error) {
    console.error("Error adding testimonial:", error);
    toast.error("Failed to add testimonial");
  } finally {
    setLoading(false);
  }
};

// Fetch testimonials
const fetchTestimonials = async () => {
  setLoading(true);
  try {
    const q = query(collection(fireDB, "testimonials"), orderBy("time", "desc"));
    const data = onSnapshot(q, (QuerySnapshot) => {
      let testimonialArray = [];
      QuerySnapshot.forEach((doc) => {
        testimonialArray.push({ ...doc.data(), id: doc.id });
      });
      setTestimonials(testimonialArray); // Get all testimonials
      setLoading(false);
    });
    return () => data();
  } catch (error) {
    console.log(error);
    setLoading(false);
  }
};

     // Delete Testimonial
    const deleteTestimonial = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(fireDB, "testimonials", id));
      toast.success("Testimonial deleted successfully");
      fetchTestimonials(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting testimonial: ", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setLoading(false);
    }
  };

  // Create or Update User Details
  const updateUserDetails = async (uid, newName, newEmail, photoURL) => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      if (user) {
        // Update displayName and photoURL in Firebase Authentication
        await updateProfile(user, { 
          displayName: newName, 
          photoURL: photoURL 
        });

        // Update in Firestore - Note: collection is "user" not "users"
        const userDocRef = doc(fireDB, "user", uid);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          await updateDoc(userDocRef, {
            name: newName,
            email: newEmail,
            photoURL: photoURL,
          });
        } else {
          await setDoc(userDocRef, {
            name: newName,
            email: newEmail,
            photoURL: photoURL,
            role: "user",
            time: Timestamp.now(),
          });
        }

        toast.success("User details updated successfully");
        getAllUserFunction();
      }
    } catch (error) {
      console.error("Error updating user details: ", error);
      toast.error("Failed to update user details");
    } finally {
      setLoading(false);
    }
  };

  // Get All Products
  const getAllProductFunction = async () => {
    setLoading(true);
    try {
      const q = query(collection(fireDB, "products"), orderBy("time"));
      const data = onSnapshot(q, (QuerySnapshot) => {
        let productArray = [];
        QuerySnapshot.forEach((doc) => {
          productArray.push({ ...doc.data(), id: doc.id });
        });
        setGetAllProduct(productArray);
        setLoading(false);
      });
      return () => data;
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Get All Orders
  const getAllOrderFunction = async () => {
    setLoading(true);
    try {
      const q = query(collection(fireDB, "order"), orderBy("time"));
      const data = onSnapshot(q, (QuerySnapshot) => {
        let orderArray = [];
        QuerySnapshot.forEach((doc) => {
          orderArray.push({ ...doc.data(), id: doc.id });
        });
        setGetAllOrder(orderArray);
        setLoading(false);
      });
      return () => data;
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Delete Order
  const orderDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(fireDB, "order", id));
      toast.success("Order Deleted successfully");
      getAllOrderFunction();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Get All Users
  const getAllUserFunction = async () => {
    setLoading(true);
    try {
      const q = query(collection(fireDB, "user"), orderBy("time"));
      const data = onSnapshot(q, (QuerySnapshot) => {
        let userArray = [];
        QuerySnapshot.forEach((doc) => {
          userArray.push({ ...doc.data(), id: doc.id });
        });
        setGetAllUser(userArray);
        setLoading(false);
      });
      return () => data;
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Update User Role
  const updateUserRole = async (uid, currentRole) => {
    setLoading(true);
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const userDocRef = doc(fireDB, "user", uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      await updateDoc(userDocRef, {
        role: newRole,
        // Preserve existing data
        name: userData?.name,
        email: userData?.email,
        photoURL: userData?.photoURL,
      });

      toast.success(`Role updated to ${newRole}`);
      getAllUserFunction();
    } catch (error) {
      console.error("Error updating role: ", error);
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // Update Order Status
  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      const orderDocRef = doc(fireDB, "order", orderId);
      await updateDoc(orderDocRef, {
        status: status,
      });
      toast.success("Order status updated successfully");
      getAllOrderFunction();
    } catch (error) {
      console.error("Error updating order status: ", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  // Delete User
  const deleteUser = async (uid) => {
    setLoading(true);
    try {
      // Delete from Firestore
      const userDocRef = doc(fireDB, "user", uid);
      await deleteDoc(userDocRef);

      // Optionally, delete from Authentication if needed
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid === uid) {
        await fbDeleteUser(user);
      }

      toast.success("User deleted successfully");
      getAllUserFunction();
    } catch (error) {
      console.error("Error deleting user: ", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Create User
  const createUser = async (name, email, password, role = "user") => {
    setLoading(true);
    const auth = getAuth();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update auth profile first
      await updateProfile(user, { 
        displayName: name 
      });

      // Save to Firestore with all necessary fields
      const userDocRef = doc(fireDB, "user", user.uid);
      const userData = {
        name: name,
        email: email,
        role: role,
        photoURL: user.photoURL || "",
        time: Timestamp.now(),
      };

      await setDoc(userDocRef, userData);
      console.log("User created with data:", userData);

      toast.success("Registration Successful");
      getAllUserFunction();
    } catch (error) {
      console.error("Error in createUser:", error);
      toast.error("Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle stock updates
  const updateProductStock = async (productId, newStock) => {
    setLoading(true);
    try {
      const productRef = doc(fireDB, "products", productId);
      await updateDoc(productRef, {
        stock: newStock
      });
      toast.success("Stock updated successfully");
      getAllProductFunction();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProductFunction();
    getAllOrderFunction();
    getAllUserFunction();
    fetchTestimonials();
  }, []);

  return (
    <MyContext.Provider
      value={{
        loading,
        setLoading,
        getAllProduct,
        getAllProductFunction,
        getAllOrder,
        orderDelete,
        getAllUser,
        updateUserRole,
        updateUserDetails,
        updateOrderStatus,
        deleteUser,
        createUser,
        testimonials,
        addTestimonial,
        getAllTestimonials: testimonials,
        deleteTestimonial,
        updateProductStock,
        calculateAverageRating,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

export default MyState;
