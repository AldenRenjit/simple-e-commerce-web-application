import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import api from '../api/axios.ts';
import toast from 'react-hot-toast';
import { CreditCard, MapPin, ClipboardList, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { items, totals, clearCart } = useCart();
  const navigate = useNavigate();

  // Multi-step phase indicators (1: Address, 2: Payment)
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  // Shipping state
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States'
  });

  // Credit Card mock state
  const [paymentData, setPaymentData] = useState({
    cardNumber: '4242 4242 4242 4242', // default test card
    cardExpiry: '12/28',
    cardCvv: '123'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(p => ({ ...p, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(p => ({ ...p, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zip) {
      toast.error('Please complete all shipping address fields.');
      return;
    }
    setStep(2);
  };

  const handleFinishPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart has been cleared or is empty.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        shipping_address: shippingAddress,
        stripe_payment_id: `ch_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };

      const response = await api.post('/orders', payload);
      const order = response.data;

      toast.success('Awesome! Your purchase was authorized and processed!', {
        duration: 5000,
        icon: '🎉'
      });
      
      // Clear Cart state
      clearCart();

      // Redirect to Order Detail Page
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Payment authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50/70 min-h-screen pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Indicator Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 font-sans">
            Checkout Process
          </h2>

          <div className="flex items-center justify-center max-w-md mx-auto relative px-4">
            
            {/* Step 1 marker */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200 ${
                step === 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-emerald-550 text-white'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-[10px] font-bold uppercase mt-1 text-gray-700">Shipping</span>
            </div>

            {/* Progress line */}
            <div className="flex-1 h-1 bg-gray-200 mx-3 rounded-full relative -top-2">
              <div className={`h-full bg-indigo-650 rounded-full transition-all duration-300 ${
                step > 1 ? 'w-full' : 'w-0'
              }`}></div>
            </div>

            {/* Step 2 marker */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200 ${
                step === 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-[10px] font-bold uppercase mt-1 text-gray-700">Payment</span>
            </div>

          </div>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Main action Column 1-3 */}
          <div className="lg:col-span-3">
            
            {/* Step 1 Form: Shipping details */}
            {step === 1 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-2.5 mb-6 pb-2 border-b border-gray-50">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs">Shipping Destination</h3>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  
                  {/* Recipient name */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Recipient Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="John Doe"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400 font-medium"
                    />
                  </div>

                  {/* Street address */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="123 Shopping Lane, Apt 4C"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="San Francisco"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400 font-medium"
                      />
                    </div>

                    {/* Postal/Zip code */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Zip / Postal Code</label>
                      <input
                        type="text"
                        name="zip"
                        required
                        placeholder="94103"
                        value={shippingAddress.zip}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Country Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Japan">Japan</option>
                    </select>
                  </div>

                  {/* Next Step trigger */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl mt-6 transition-all duration-200"
                  >
                    <span>Proceed to Secure Payment</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>

                </form>
              </div>
            )}

            {/* Step 2 Form: stripe mocked card details */}
            {step === 2 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-gray-950 uppercase tracking-wide text-xs">Payment Information</h3>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-indigo-600 hover:text-indigo-805 text-xs font-bold inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                </div>

                <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl p-4 space-y-2 text-emerald-805">
                  <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Stripe API Test Sandbox Activated</span>
                  </div>
                  <p className="text-xs text-emerald-600/90 leading-relaxed">
                    Enter the standard mock credentials. Stock updates, transaction logs, and billing invoices will process automatically in SQLite database.
                  </p>
                </div>

                <form onSubmit={handleFinishPurchase} className="space-y-4">
                  
                  {/* Card Number */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Standard Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentChange}
                      className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-mono text-center text-sm font-bold tracking-widest"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        required
                        placeholder="MM/YY"
                        value={paymentData.cardExpiry}
                        onChange={handlePaymentChange}
                        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-center font-bold"
                      />
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Security Code (CVV)</label>
                      <input
                        type="text"
                        name="cardCvv"
                        required
                        placeholder="123"
                        value={paymentData.cardCvv}
                        onChange={handlePaymentChange}
                        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Submit checkout */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl mt-6 transition-all duration-300 ${
                      submitting ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    <span>{submitting ? 'Authorizing billing invoice...' : `Commit Payment of $${totals.total.toFixed(2)}`}</span>
                  </button>

                </form>
              </div>
            )}

          </div>

          {/* Cart summary panel column 4-5 */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                <h4 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs">Order Summary</h4>
              </div>

              {/* Items scroll */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3 max-w-[70%]">
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-50"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold text-gray-800 line-clamp-1">{item.product?.name}</span>
                    </div>
                    <span className="text-gray-400 text-xs font-bold">x{item.quantity}</span>
                    <span className="font-bold text-gray-900 font-sans">
                      ${(parseFloat(item.product?.price as string || '0') * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              {/* Totals math */}
              <div className="space-y-2.5 text-sm font-semibold pt-1">
                <div className="flex justify-between text-gray-550 font-medium">
                  <span>Subtotal</span>
                  <span className="font-sans text-gray-900">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-555 font-medium">
                  <span>VAT Tax (10%)</span>
                  <span className="font-sans text-gray-900">${totals.tax.toFixed(2)}</span>
                </div>
                
                <hr className="border-gray-100" />

                <div className="flex justify-between text-gray-950 font-extrabold text-base pt-1">
                  <span>Charged Amount</span>
                  <span className="font-sans text-lg text-indigo-600">${totals.total.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Safe visual badge parameters */}
            <div className="text-center font-bold text-[10px] text-gray-400 uppercase flex items-center justify-center gap-1 select-none">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
              <span>SSL SECURED • AES-256 ENCRYPTION</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
