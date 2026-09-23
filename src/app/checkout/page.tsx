'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UPIPaymentQR } from '@/components/UPIPaymentQR';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Address, StoreSettings } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  User,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Customer Details
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Step 2: Delivery Address
  const [addressDetails, setAddressDetails] = useState({
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Load Settings & Saved Addresses
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => {});

    if (user) {
      setCustomerDetails({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      fetch('/api/addresses')
        .then((res) => res.json())
        .then((data) => {
          const addresses: Address[] = data.addresses || [];
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setAddressDetails({
              houseNo: defaultAddr.houseNo,
              street: defaultAddr.street,
              area: defaultAddr.area,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
              landmark: defaultAddr.landmark || '',
              addressType: defaultAddr.addressType,
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Pricing
  const freeThreshold = settings?.freeShippingThreshold ?? 1999;
  const shippingCharge = subtotal >= freeThreshold || subtotal === 0 ? 0 : settings?.shippingCharge ?? 99;
  const taxPercentage = settings?.taxPercentage ?? 5;
  const taxAmount = Math.round((subtotal * taxPercentage) / 100);
  const totalAmount = subtotal + shippingCharge + taxAmount;
  const storeUpiId = settings?.upiId || '6369537463@ptsbi';
  const storeName = settings?.storeName || "Aboo'sBoutique";

  // Step Validations
  const validateStep1 = () => {
    if (!customerDetails.fullName || !customerDetails.email || !customerDetails.phone) {
      showToast('Please fill in your name, email, and phone number', 'error');
      return false;
    }
    if (!customerDetails.email.includes('@')) {
      showToast('Please provide a valid email address', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !addressDetails.houseNo ||
      !addressDetails.street ||
      !addressDetails.area ||
      !addressDetails.city ||
      !addressDetails.state ||
      !addressDetails.pincode
    ) {
      showToast('Please complete all required delivery address fields', 'error');
      return false;
    }
    if (addressDetails.pincode.length < 6) {
      showToast('Please enter a valid 6-digit postal pincode', 'error');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setAddressDetails({
      houseNo: addr.houseNo,
      street: addr.street,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || '',
      addressType: addr.addressType,
    });
  };

  // Final Payment Submission & Order Creation
  const handlePaymentSubmitted = async (transactionRef?: string) => {
    if (cart.length === 0) {
      showToast('Your bag is empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerDetails.fullName,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        address: {
          ...addressDetails,
          fullName: customerDetails.fullName,
          phone: customerDetails.phone,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productImage:
            item.product.images?.find((img) => img.isPrimary)?.url ||
            item.product.images?.[0]?.url ||
            '/logo.svg',
          size: item.size,
          color: item.color,
          price: item.product.discountPrice ?? item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        shippingCharge,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        paymentStatus: 'submitted', // As required in prototype flow
        upiRef: transactionRef || `UPI-${Date.now()}`,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to submit order', 'error');
        setIsSubmitting(false);
        return;
      }

      clearCart();
      showToast('Payment submitted! Order created successfully.', 'success');
      router.push(`/order-success/${data.order.orderNumber}`);
    } catch {
      showToast('Network error while creating order. Please retry.', 'error');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
        <Header />
        <div className="flex-1 max-w-xl mx-auto px-4 py-24 text-center">
          <ShoppingBag className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
            Your shopping bag is empty
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Please add bespoke garments to your bag before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-neutral-800"
          >
            Return to Boutique
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Checkout Stepper Progress */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-neutral-200 z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-900 transition-all duration-500 z-0"
              style={{
                width:
                  currentStep === 1
                    ? '0%'
                    : currentStep === 2
                    ? '33%'
                    : currentStep === 3
                    ? '66%'
                    : '100%',
              }}
            />

            {[
              { num: 1, label: 'Patron Info' },
              { num: 2, label: 'Delivery Address' },
              { num: 3, label: 'Review Summary' },
              { num: 4, label: 'UPI QR Payment' },
            ].map((st) => (
              <div
                key={st.num}
                className="relative z-10 flex flex-col items-center cursor-pointer"
                onClick={() => {
                  if (st.num < currentStep) setCurrentStep(st.num as any);
                }}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep >= st.num
                      ? 'bg-neutral-900 text-white ring-4 ring-white shadow-md'
                      : 'bg-white border-2 border-neutral-300 text-neutral-400'
                  }`}
                >
                  {currentStep > st.num ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                  ) : (
                    st.num
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-wider uppercase mt-2 ${
                    currentStep >= st.num ? 'text-neutral-900' : 'text-neutral-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form Area (7 cols) */}
          <div className="lg:col-span-7">
            {/* Step 1: Customer Details */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
                  <User className="w-5 h-5 text-brand-gold" />
                  <h2 className="font-serif text-xl font-bold text-neutral-900">
                    Step 1: Patron Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rohan Sharma"
                      value={customerDetails.fullName}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, fullName: e.target.value })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rohan@example.com"
                        value={customerDetails.email}
                        onChange={(e) =>
                          setCustomerDetails({ ...customerDetails, email: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98450 12345"
                        value={customerDetails.phone}
                        onChange={(e) =>
                          setCustomerDetails({ ...customerDetails, phone: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg transition-all"
                  >
                    <span>Proceed to Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                    <h2 className="font-serif text-xl font-bold text-neutral-900">
                      Step 2: Delivery Address
                    </h2>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-neutral-400 hover:text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                {/* Saved addresses selector if available */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                      Choose From Saved Addresses:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-neutral-900">
                              {addr.fullName}
                            </span>
                            <span className="text-[10px] uppercase font-semibold bg-neutral-200 px-2 py-0.5 rounded">
                              {addr.addressType}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                            {addr.houseNo}, {addr.street}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Form Inputs */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        House / Flat / Suite No. *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Villa 12, Palm Meadows"
                        value={addressDetails.houseNo}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, houseNo: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Street / Road *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HAL Airport Road"
                        value={addressDetails.street}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, street: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Locality / Area *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kodihalli, Indiranagar"
                        value={addressDetails.area}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, area: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Leela Palace"
                        value={addressDetails.landmark}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, landmark: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={addressDetails.city}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, city: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        placeholder="Karnataka"
                        value={addressDetails.state}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, state: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="560008"
                        value={addressDetails.pincode}
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, pincode: e.target.value })
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Address Classification
                    </label>
                    <div className="flex gap-4">
                      {['Home', 'Work', 'Other'].map((type) => (
                        <label
                          key={type}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-xs font-semibold ${
                            addressDetails.addressType === type
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-200 bg-white text-neutral-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressType"
                            value={type}
                            checked={addressDetails.addressType === type}
                            onChange={() =>
                              setAddressDetails({ ...addressDetails, addressType: type })
                            }
                            className="sr-only"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-black"
                  >
                    Back to Patron Info
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg transition-all"
                  >
                    <span>Review Order Summary</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Summary Review */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-gold" />
                    <h2 className="font-serif text-xl font-bold text-neutral-900">
                      Step 3: Order Summary Review
                    </h2>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-neutral-400 hover:text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                {/* Recipient & Destination Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Patron
                    </span>
                    <p className="font-semibold text-neutral-900">{customerDetails.fullName}</p>
                    <p className="text-neutral-600">{customerDetails.email}</p>
                    <p className="text-neutral-600">{customerDetails.phone}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Destination ({addressDetails.addressType})
                    </span>
                    <p className="text-neutral-800 leading-relaxed">
                      {addressDetails.houseNo}, {addressDetails.street}, {addressDetails.area}
                      {addressDetails.landmark ? `, Landmark: ${addressDetails.landmark}` : ''},
                      <br />
                      {addressDetails.city}, {addressDetails.state} - {addressDetails.pincode}
                    </p>
                  </div>
                </div>

                {/* Product items list */}
                <div className="divide-y divide-neutral-100">
                  {cart.map((item) => {
                    const price = item.product.discountPrice ?? item.product.price;
                    const img =
                      item.product.images?.find((i) => i.isPrimary)?.url ||
                      item.product.images?.[0]?.url ||
                      '/logo.svg';

                    return (
                      <div key={item.id} className="py-3 flex items-center gap-4">
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                          <Image
                            src={img}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm font-semibold text-neutral-900 truncate">
                            {item.product.name}
                          </p>
                          <div className="flex gap-2 text-xs text-neutral-500 mt-0.5">
                            <span>Size: {item.size}</span>
                            <span>•</span>
                            <span>Color: {item.color}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right font-semibold text-sm text-neutral-900 font-sans">
                          {formatINR(price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-black"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg transition-all"
                  >
                    <span>Proceed to UPI Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: UPI QR Payment */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-neutral-500 hover:text-black inline-flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modify Order Details</span>
                </button>

                <UPIPaymentQR
                  amount={totalAmount}
                  upiId={storeUpiId}
                  storeName={storeName}
                  onPaymentSubmitted={handlePaymentSubmitted}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Right Column: Order Pricing Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
              <h3 className="font-serif text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Order Value
              </h3>

              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery / Shipping</span>
                  <span>{shippingCharge === 0 ? 'FREE' : formatINR(shippingCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Taxes ({taxPercentage}%)</span>
                  <span>{formatINR(taxAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-neutral-900 block">Total Payable</span>
                  <span className="text-[11px] text-neutral-400">Inclusive of all taxes</span>
                </div>
                <span className="text-3xl font-bold text-brand-gold font-sans">
                  {formatINR(totalAmount)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Direct Merchant UPI Integration</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  Scannable QR is dynamically encoded with exactly{' '}
                  <strong className="text-neutral-800">{formatINR(totalAmount)}</strong> and routed directly to the boutique&apos;s verified UPI ID ({storeUpiId}).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
