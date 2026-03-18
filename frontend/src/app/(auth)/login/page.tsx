// "use client"

// import { useState } from 'react';
// import { Mail, Lock, Loader2, ShoppingCart, Sprout } from 'lucide-react';
// import { useRouter } from "next/navigation";

// export default function OTPLogin() {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [userType, setUserType] = useState('buyer'); // 'buyer' or 'farmer'
//   const [step, setStep] = useState('type'); // 'type', 'email', or 'otp'
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });
//   const [user, setUser] = useState(null);

//   const API_BASE = 'http://localhost:8000';
//   const router = useRouter();

//   const handleUserTypeSelect = (type: string) => {
//     setUserType(type);
//     setStep('email');
//   };

//   const handleSendOTP = async () => {
//     setLoading(true);
//     setMessage({ text: '', type: '' });

//     try {
//       const response = await fetch(`${API_BASE}/auth/send-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, user_type: userType }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage({ text: `OTP sent to your email for ${userType} login!`, type: 'success' });
//         setStep('otp');
//       } else {
//         setMessage({ text: data.detail || 'Failed to send OTP', type: 'error' });
//       }
//     } catch (error) {
//       setMessage({ text: 'Network error. Please try again.', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     setLoading(true);
//     setMessage({ text: '', type: '' });

//     try {
//       const response = await fetch(`${API_BASE}/auth/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp, user_type: userType }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('access_token', data.access_token);
//         setMessage({ text: 'Login successful!', type: 'success' });
//         setUser(data.user);
//         router.push("/");          // 👈 MAIN PAGE
//         router.refresh();
//       } else {
//         setMessage({ text: data.detail || 'Invalid OTP', type: 'error' });
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage({ text: 'Network error. Please try again.', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('user_type');
//     setUser(null);
//     setStep('type');
//     setEmail('');
//     setOtp('');
//     setUserType('buyer');
//     setMessage({ text: '', type: '' });
//   };

//   const handleBack = () => {
//     if (step === 'email') {
//       setStep('type');
//     } else if (step === 'otp') {
//       setStep('email');
//     }
//   };

//   const handleEmailKeyPress = (e: any) => {
//     if (e.key === 'Enter' && email) {
//       handleSendOTP();
//     }
//   };

//   const handleOTPKeyPress = (e: any) => {
//     if (e.key === 'Enter' && otp.length === 6) {
//       handleVerifyOTP();
//     }
//   };

//   if (user) {
//     const isBuyer = userType === 'buyer';
//     const bgColor = isBuyer ? 'from-blue-50 to-indigo-100' : 'from-green-50 to-emerald-100';
//     const accentColor = isBuyer ? 'bg-blue-600' : 'bg-green-600';
//     const Icon = isBuyer ? ShoppingCart : Sprout;

//     return (
//       <div className={`min-h-screen bg-gradient-to-br ${bgColor} flex items-center justify-center p-4`}>
//         <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
//           <div className="text-center">
//             <div className={`w-20 h-20 ${accentColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
//               <Icon className="w-10 h-10 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">
//               Welcome {isBuyer ? 'Buyer' : 'Farmer'}!
//             </h2>
//             <p className="text-gray-600 mb-6">You're successfully logged in</p>

//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//               <p className="text-sm text-gray-600">Account Type:</p>
//               <p className="font-semibold text-gray-800 capitalize">{userType}</p>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <p className="text-sm text-gray-600">Email:</p>
//               <p className="font-semibold text-gray-800">{user.email}</p>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex">
//       <div className="rounded-2xl shadow-xl flex bg-[#f1fffe] items-center justify-center flex-col w-1/2">

//         <div className="w-full max-w-md">
//           {step !== 'type' && (
//             <button
//               onClick={handleBack}
//               className="mb-4 text-gray-600 hover:text-gray-800 flex items-center text-sm"
//             >
//               ← Back
//             </button>
//           )}

//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-gradient-to-b from-blue-600 to-[#04a091] rounded-full flex items-center justify-center mx-auto mb-4">
//               <Lock className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-800">Welcome To Agrilink</h1>
//             <p className="text-gray-600 mt-2">
//               {step === 'type' && 'Choose your account type'}
//               {step === 'email' && `Continue as ${userType === 'buyer' ? 'Buyer' : 'Farmer'}`}
//               {step === 'otp' && 'Enter the OTP sent to your email'}
//             </p>
//           </div>

//           {message.text && (
//             <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
//               }`}>
//               {message.text}
//             </div>
//           )}

//           {step === 'type' && (
//             <div className="space-y-4">
//               <button
//                 onClick={() => handleUserTypeSelect('buyer')}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition flex items-center justify-center gap-3 group"
//               >
//                 <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
//                 <span>Continue as Buyer</span>
//               </button>

//               <button
//                 onClick={() => handleUserTypeSelect('farmer')}
//                 className="w-full bg-[#04a091] text-white py-4 rounded-lg font-semibold transition flex items-center justify-center gap-3 group"
//               >
//                 <Sprout className="w-6 h-6 group-hover:scale-110 transition-transform" />
//                 <span>Continue as Farmer</span>
//               </button>
//             </div>
//           )}

//           {step === 'email' && (
//             <div>
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     onKeyPress={handleEmailKeyPress}
//                     placeholder="you@example.com"
//                     required
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={handleSendOTP}
//                 disabled={loading || !email}
//                 className={`w-full ${userType === 'buyer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
//                   } text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="animate-spin mr-2 w-5 h-5" />
//                     Sending OTP...
//                   </>
//                 ) : (
//                   'Send OTP'
//                 )}
//               </button>
//             </div>
//           )}

//           {step === 'otp' && (
//             <div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Enter OTP
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   onKeyPress={handleOTPKeyPress}
//                   placeholder="000000"
//                   required
//                   maxLength={6}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-semibold"
//                 />
//               </div>

//               <button
//                 onClick={handleVerifyOTP}
//                 disabled={loading || otp.length !== 6}
//                 className={`w-full ${userType === 'buyer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
//                   } text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-3`}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="animate-spin mr-2 w-5 h-5" />
//                     Verifying...
//                   </>
//                 ) : (
//                   'Verify OTP'
//                 )}
//               </button>

//               <div className="text-center text-sm text-gray-600">
//                 <p>Didn't receive the code? <button onClick={() => setStep('email')} className="text-indigo-600 hover:underline">Resend OTP</button></p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 opacity-70 bg-[url('https://plus.unsplash.com/premium_photo-1663045650293-4ddba07dc462?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGFncmljdWx0dXJlJTIwZmFybWVyJTIwcG9zdGVyfGVufDB8fDB8fHww')] bg-cover bg-no-repeat" />
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect } from "react";
// import { Mail, Lock, Loader2, ShoppingCart, Sprout, Upload } from "lucide-react";
// import { useRouter } from "next/navigation";

// type Step = "type" | "email" | "otp" | "profile";

// export default function OTPLogin() {
//   const [step, setStep] = useState<Step>("type");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [userType, setUserType] = useState<"buyer" | "farmer">("buyer");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<{ text: string; type: string }>({ text: "", type: "" });
//   const [user, setUser] = useState<any>(null);

//   const [profile, setProfile] = useState({
//     name: "",
//     phone: "",
//     location: "",
//   });

//   const API_BASE = "http://localhost:8000";
//   const router = useRouter();

//   /* ---------------- USER TYPE ---------------- */
//   const handleUserTypeSelect = (type: "buyer" | "farmer") => {
//     setUserType(type);
//     setStep("email");
//   };

//   /* ---------------- SEND OTP ---------------- */
//   const handleSendOTP = async () => {
//     setLoading(true);
//     setMessage({ text: "", type: "" });
//     try {
//       const res = await fetch(`${API_BASE}/auth/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Failed to send OTP");

//       setMessage({ text: "OTP sent successfully", type: "success" });
//       setStep("otp");
//     } catch (e: any) {
//       setMessage({ text: e.message, type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- VERIFY OTP ---------------- */
//   const handleVerifyOTP = async () => {
//     setLoading(true);
//     setMessage({ text: "", type: "" });

//     try {
//       const res = await fetch(`${API_BASE}/auth/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Invalid OTP");

//       // Save token
//       localStorage.setItem("access_token", data.access_token);

//       // Fetch user profile
//       const userRes = await fetch(`${API_BASE}/auth/me`, {
//         headers: { Authorization: `Bearer ${data.access_token}` },
//       });
//       const userData = await userRes.json();

//       setUser(userData);

//       // If new user without name/phone → complete profile
//       if (!userData.name || !userData.phone) {
//         setStep("profile");
//         setProfile({
//           name: userData.name || "",
//           phone: userData.phone || "",
//           location: userData.location || "",
//         });
//       } else {
//         // router.push("/");
//         // router.refresh();
//       }
//     } catch (e: any) {
//       setMessage({ text: e.message, type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- COMPLETE PROFILE ---------------- */
//   const handleCompleteProfile = async () => {
//     setLoading(true);
//     setMessage({ text: "", type: "" });
//     try {
//       const token = localStorage.getItem("access_token");
//       const res = await fetch(`${API_BASE}/auth/complete-profile`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name: profile.name,
//           phone: profile.phone,
//           location: profile.location,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Failed to update profile");

//       setUser(data.user);
//       // router.refresh();
//     } catch (e: any) {
//       setMessage({ text: e.message, type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- IMAGE UPLOAD ---------------- */
//   const handleImageUpload = async (file: File) => {
//     const token = localStorage.getItem("access_token");
//     if (!token) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch(`${API_BASE}/auth/upload-profile-image`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: formData,
//     });

//     if (res.ok) {
//       const userRes = await fetch(`${API_BASE}/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const userData = await userRes.json();
//       setUser(userData);
//     }
//   };

//   /* ---------------- BACK ---------------- */
//   const handleBack = () => {
//     if (step === "email") setStep("type");
//     if (step === "otp") setStep("email");
//     if (step === "profile") setStep("otp");
//   };

//   /* ---------------- LOGOUT ---------------- */
//   const handleLogout = () => {
//     localStorage.removeItem("access_token");
//     setUser(null);
//     setStep("type");
//     setEmail("");
//     setOtp("");
//     setProfile({ name: "", phone: "", location: "" });
//   };

//   /* ---------------- UI ---------------- */
// // if (user && user.name && user.phone) {

// //     const Icon = ShoppingCart;
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //         <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg text-center">
// //           <Icon className="w-10 h-10 mx-auto text-green-600 mb-2" />

// //           <img
// //             src={
// //               user.profile_image
// //                 ? `${API_BASE}${user.profile_image}`
// //                 : "https://via.placeholder.com/100"
// //             }
// //             className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
// //           />

// //           <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 mb-3">
// //             <Upload size={16} />
// //             Upload Image
// //             <input
// //               type="file"
// //               hidden
// //               accept="image/*"
// //               onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
// //             />
// //           </label>

// //           <h2 className="text-xl font-bold">{user.name || "New User"}</h2>
// //           <p className="text-gray-600">{user.email}</p>
// //           {/* <p className="text-sm mt-1">Role: {user.role}</p> */}

// //           <button
// //             onClick={handleLogout}
// //             className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg"
// //           >
// //             Logout
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

//   return (
//     <div className="min-h-screen flex">
//       <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f1fffe]">
//         <div className="w-full max-w-md p-6">
//           {step !== "type" && (
//             <button onClick={handleBack} className="mb-4 text-sm text-gray-600">
//               ← Back
//             </button>
//           )}

//           <div className="text-center mb-6">
//             <div className="w-16 h-16 bg-gradient-to-b from-blue-600 to-[#04a091] rounded-full flex items-center justify-center mx-auto mb-3">
//               <Lock className="text-white w-8 h-8" />
//             </div>
//             <h1 className="text-2xl font-bold">Welcome to Agrilink</h1>
//             <p className="text-gray-600">
//               {step === "type" && "Choose account type"}
//               {step === "email" && "Enter your email"}
//               {step === "otp" && "Verify OTP"}
//               {step === "profile" && "Complete your profile"}
//             </p>
//           </div>

//           {message.text && (
//             <div
//               className={`mb-4 p-3 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
//                 }`}
//             >
//               {message.text}
//             </div>
//           )}

//           {step === "type" && (
//             <div className="space-y-4">
//               <button
//                 onClick={() => handleUserTypeSelect("buyer")}
//                 className="w-full bg-blue-600 text-white py-3 rounded flex justify-center gap-2"
//               >
//                 <ShoppingCart /> Buyer
//               </button>
//               <button
//                 onClick={() => handleUserTypeSelect("farmer")}
//                 className="w-full bg-green-600 text-white py-3 rounded flex justify-center gap-2"
//               >
//                 <Sprout /> Farmer
//               </button>
//             </div>
//           )}

//           {step === "email" && (
//             <>
//               <input
//                 type="email"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full border px-4 py-3 rounded mb-4"
//               />
//               <button
//                 onClick={handleSendOTP}
//                 disabled={loading || !email}
//                 className="w-full bg-indigo-600 text-white py-3 rounded"
//               >
//                 {loading ? "Sending..." : "Send OTP"}
//               </button>
//             </>
//           )}

//           {step === "otp" && (
//             <>
//               <input
//                 type="text"
//                 maxLength={6}
//                 placeholder="000000"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                 className="w-full border px-4 py-3 rounded mb-4 text-center text-xl"
//               />
//               <button
//                 onClick={handleVerifyOTP}
//                 disabled={loading || otp.length !== 6}
//                 className="w-full bg-indigo-600 text-white py-3 rounded"
//               >
//                 {loading ? "Verifying..." : "Verify OTP"}
//               </button>
//             </>
//           )}

//           {step === "profile" && (
//             <>
//               <input
//                 placeholder="Full Name"
//                 value={profile.name}
//                 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
//                 className="w-full border px-4 py-3 rounded mb-3"
//               />
//               <input
//                 placeholder="Phone"
//                 value={profile.phone}
//                 onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
//                 className="w-full border px-4 py-3 rounded mb-3"
//               />
//               <input
//                 placeholder="Location (optional)"
//                 value={profile.location}
//                 onChange={(e) => setProfile({ ...profile, location: e.target.value })}
//                 className="w-full border px-4 py-3 rounded mb-4"
//               />
//               <button
//                 onClick={handleCompleteProfile}
//                 disabled={loading || !profile.name || !profile.phone}
//                 className="w-full bg-green-600 text-white py-3 rounded"
//               >
//                 {loading ? "Saving..." : "Complete Profile"}
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Right Image */}
//       <div
//         className="hidden lg:flex w-1/2 bg-cover bg-center"
//         style={{
//           backgroundImage:
//             "url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6)",
//         }}
//       />
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { Lock, ShoppingCart, Sprout } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useCompleteProfile, useCurrentUser, useSendOTP, useVerifyOTP } from "@component/hooks/queries/useAuth";

// type Step = "type" | "email" | "otp" | "profile";

// export default function OTPLogin() {
//   const [step, setStep] = useState<Step>("type");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [userType, setUserType] = useState<"buyer" | "farmer">("buyer");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<{ text: string; type: string }>({ text: "", type: "" });
//   const [user, setUser] = useState<any>(null);

//   const [profile, setProfile] = useState({
//     name: "",
//     phone: "",
//     location: "",
//   });

//   const verifyOTP = useVerifyOTP();
//   const sendOTP = useSendOTP();
//   const completeProfile = useCompleteProfile();
//   // const { data: user, refetch: refetchUser } = useCurrentUser();


//   // const API_BASE = "http://localhost:8000";
//   // const router = useRouter();


//   /* ---------------- AUTO LOGIN ---------------- */
//   // useEffect(() => {
//   //   const token = localStorage.getItem("access_token");
//   //   if (!token) return;

//   //   fetch(`${API_BASE}/auth/me`, {
//   //     headers: { Authorization: `Bearer ${token}` },
//   //   })
//   //     .then(res => res.ok ? res.json() : null)
//   //     .then(user => {
//   //       if (!user) return;
//   //       setUser(user);
//   //       router.replace("/");
//   //     });
//   // }, []);


//   /* ---------------- USER TYPE ---------------- */
//   const handleUserTypeSelect = (type: "buyer" | "farmer") => {
//     setUserType(type);
//     setStep("email");
//   };

//   /* ---------------- SEND OTP ---------------- */
//   // const handleSendOTP = async () => {
//   //   setLoading(true);
//   //   setMessage({ text: "", type: "" });

//   //   try {
//   //     const res = await fetch(`${API_BASE}/auth/send-otp`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ email }),
//   //     });

//   //     const data = await res.json();
//   //     if (!res.ok) throw new Error(data.detail || "Failed to send OTP");

//   //     setStep("otp");
//   //     setMessage({ text: "OTP sent successfully", type: "success" });
//   //   } catch (e: any) {
//   //     setMessage({ text: e.message, type: "error" });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSendOTP = async () => {
//     try {
//       await sendOTP.mutateAsync(email);
//       setStep("otp");
//     } catch (err: any) {
//       setMessage({ text: err.message || "Failed to send OTP", type: "error" });
//     }
//   };

//   /* ---------------- VERIFY OTP ---------------- */
//   // const handleVerifyOTP = async () => {
//   //   setLoading(true);
//   //   setMessage({ text: "", type: "" });

//   //   try {
//   //     const res = await fetch(`${API_BASE}/auth/verify-otp`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ email, otp }),
//   //     });

//   //     const data = await res.json();
//   //     if (!res.ok) throw new Error(data.detail || "Invalid OTP");

//   //     localStorage.setItem("access_token", data.access_token);

//   //     // 🔥 DO NOT call /auth/me here
//   //     // Always send new users to profile
//   //     setStep("profile");

//   //   } catch (e: any) {
//   //     setMessage({ text: e.message, type: "error" });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleVerifyOTP = async () => {
//     try {
//       await verifyOTP.mutateAsync({ email, otp });
//       refetchUser(); // fetch current user after login
//       if (!user?.name || !user?.phone) setStep("profile");
//       else router.push("/"); // redirect to home if already completed
//     } catch (err: any) {
//       setMessage({ text: err.message || "Invalid OTP", type: "error" });
//     }
//   };

//   /* ---------------- COMPLETE PROFILE ---------------- */
//   // const handleCompleteProfile = async () => {
//   //   setLoading(true);
//   //   setMessage({ text: "", type: "" });

//   //   try {
//   //     const token = localStorage.getItem("access_token");
//   //     if (!token) throw new Error("No auth token");

//   //     const res = await fetch(`${API_BASE}/auth/complete-profile`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(profile),
//   //     });

//   //     if (!res.ok) {
//   //       const err = await res.json();
//   //       throw new Error(err.detail || "Profile update failed");
//   //     }

//   //     // 🔥 NOW token + user exists for sure
//   //     const meRes = await fetch(`${API_BASE}/auth/me`, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });

//   //     const userData = await meRes.json();
//   //     setUser(userData);

//   //     console.log("Profile completed, user:", userData);

//   //     // 🔥 FINAL REDIRECT
//   //     router.push("/");

//   //   } catch (e: any) {
//   //     setMessage({ text: e.message, type: "error" });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleCompleteProfile = async () => {
//     try {
//       await completeProfile.mutateAsync(profile);
//       refetchUser(); // refresh user after profile completion
//       router.push("/"); // go to home page
//     } catch (err: any) {
//       setMessage({ text: err.message || "Failed to complete profile", type: "error" });
//     }
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="min-h-screen flex">
//       <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f1fffe]">
//         <div className="w-full max-w-md p-6">
//           <div className="text-center mb-6">
//             <div className="w-16 h-16 bg-gradient-to-b from-blue-600 to-[#04a091] rounded-full flex items-center justify-center mx-auto mb-3">
//               <Lock className="text-white w-8 h-8" />
//             </div>
//             <h1 className="text-2xl font-bold">Welcome to Agrilink</h1>
//           </div>

//           {message.text && (
//             <div className={`mb-4 p-3 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
//               {message.text}
//             </div>
//           )}

//           {step === "type" && (
//             <div className="space-y-4">
//               <button onClick={() => handleUserTypeSelect("buyer")} className="w-full bg-blue-600 text-white py-3 rounded flex justify-center gap-2">
//                 <ShoppingCart /> Buyer
//               </button>
//               <button onClick={() => handleUserTypeSelect("farmer")} className="w-full bg-green-600 text-white py-3 rounded flex justify-center gap-2">
//                 <Sprout /> Farmer
//               </button>
//             </div>
//           )}

//           {step === "email" && (
//             <>
//               <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border px-4 py-3 rounded mb-4" placeholder="you@example.com" />
//               <button onClick={handleSendOTP} disabled={loading || !email} className="w-full bg-indigo-600 text-white py-3 rounded">
//                 {loading ? "Sending..." : "Send OTP"}
//               </button>
//             </>
//           )}

//           {step === "otp" && (
//             <>
//               <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} className="w-full border px-4 py-3 rounded mb-4 text-center text-xl" />
//               <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="w-full bg-indigo-600 text-white py-3 rounded">
//                 {loading ? "Verifying..." : "Verify OTP"}
//               </button>
//             </>
//           )}

//           {step === "profile" && (
//             <>
//               <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Full Name" className="w-full border px-4 py-3 rounded mb-3" />
//               <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" className="w-full border px-4 py-3 rounded mb-3" />
//               <input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Location (optional)" className="w-full border px-4 py-3 rounded mb-4" />
//               <button onClick={handleCompleteProfile} disabled={loading || !profile.name || !profile.phone} className="w-full bg-green-600 text-white py-3 rounded">
//                 {loading ? "Saving..." : "Complete Profile"}
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="hidden lg:flex w-1/2 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6)" }} />
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { Lock, ShoppingCart, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useCurrentUser,
  useSendOTP,
  useVerifyOTP,
  useCompleteProfile,
} from "@component/hooks/queries/useAuth";

type Step = "type" | "email" | "otp" | "profile";

export default function OTPLogin() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("type");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    location: "",
  });
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: "",
    type: "",
  });

  /* ---------------- REACT QUERY ---------------- */
  const { data: user, isLoading: userLoading, refetch } = useCurrentUser();
  const sendOTP = useSendOTP();
  const verifyOTP = useVerifyOTP();
  const completeProfile = useCompleteProfile();

  /* ---------------- AUTO REDIRECT IF LOGGED IN ---------------- */
  useEffect(() => {
    if (user && user.name && user.phone) {
      router.replace("/");
    }
  }, [user, router]);

  /* ---------------- USER TYPE ---------------- */
  const handleUserTypeSelect = () => {
    setStep("email");
  };

  /* ---------------- SEND OTP ---------------- */
  const handleSendOTP = async () => {
    try {
      await sendOTP.mutateAsync(email);
      setStep("otp");
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to send OTP", type: "error" });
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOTP = async () => {
    try {
      await verifyOTP.mutateAsync({ email, otp });

      const { data } = await refetch();

      if (!data?.name || !data?.phone) {
        setStep("profile");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Invalid OTP", type: "error" });
    }
  };

  /* ---------------- COMPLETE PROFILE ---------------- */
  const handleCompleteProfile = async () => {
    try {
      await completeProfile.mutateAsync(profile);
      await refetch();
      router.push("/");
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to complete profile",
        type: "error",
      });
    }
  };

  /* ---------------- UI ---------------- */
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f1fffe]">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-b from-blue-600 to-[#04a091] rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to Agrilink</h1>
          </div>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                }`}
            >
              {message.text}
            </div>
          )}

          {step === "type" && (
            <div className="space-y-4">
              <button
                onClick={handleUserTypeSelect}
                className="w-full bg-blue-600 text-white py-3 rounded flex justify-center gap-2"
              >
                <ShoppingCart /> Buyer
              </button>
              <button
                onClick={handleUserTypeSelect}
                className="w-full bg-green-600 text-white py-3 rounded flex justify-center gap-2"
              >
                <Sprout /> Farmer
              </button>
            </div>
          )}

          {step === "email" && (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-4 py-3 rounded mb-4"
                placeholder="you@example.com"
              />
              <button
                onClick={handleSendOTP}
                disabled={sendOTP.isPending || !email}
                className="w-full bg-indigo-600 text-white py-3 rounded"
              >
                {sendOTP.isPending ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <input
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                className="w-full border px-4 py-3 rounded mb-4 text-center text-xl"
              />
              <button
                onClick={handleVerifyOTP}
                disabled={verifyOTP.isPending || otp.length !== 6}
                className="w-full bg-indigo-600 text-white py-3 rounded"
              >
                {verifyOTP.isPending ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {step === "profile" && (
            <>
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Full Name"
                className="w-full border px-4 py-3 rounded mb-3"
              />
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="Phone"
                className="w-full border px-4 py-3 rounded mb-3"
              />
              <input
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                placeholder="Location (optional)"
                className="w-full border px-4 py-3 rounded mb-4"
              />
              <button
                onClick={handleCompleteProfile}
                disabled={
                  completeProfile.isPending ||
                  !profile.name ||
                  !profile.phone
                }
                className="w-full bg-green-600 text-white py-3 rounded"
              >
                {completeProfile.isPending
                  ? "Saving..."
                  : "Complete Profile"}
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6)",
        }}
      />
    </div>
  );
}

