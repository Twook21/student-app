'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, IdCard, AlertCircle, CheckCircle, ArrowLeft, Users } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  name: string;
  nisn: string;
  nip: string;
  classId: string;
  childrenNisn: string[];
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    name: '',
    nisn: '',
    nip: '',
    classId: '',
    childrenNisn: ['']
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  const roles = [
    { value: 'SISWA', label: 'Siswa', icon: '🎓' },
    { value: 'GURU', label: 'Guru', icon: '👨‍🏫' },
    { value: 'ORANGTUA', label: 'Orang Tua', icon: '👨‍👩‍👧‍👦' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleChildrenNisnChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      childrenNisn: prev.childrenNisn.map((nisn, i) => i === index ? value : nisn)
    }));
  };

  const addChildNisn = () => {
    setFormData(prev => ({
      ...prev,
      childrenNisn: [...prev.childrenNisn, '']
    }));
  };

  const removeChildNisn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      childrenNisn: prev.childrenNisn.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.role || !formData.name) {
      return 'Semua field wajib diisi';
    }

    if (formData.password.length < 6) {
      return 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Konfirmasi password tidak cocok';
    }

    if (formData.role === 'SISWA' && !formData.nisn) {
      return 'NISN wajib diisi untuk siswa';
    }

    if (formData.role === 'GURU' && !formData.nip) {
      return 'NIP wajib diisi untuk guru';
    }

    return null;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        ...(formData.role === 'SISWA' && { nisn: formData.nisn }),
        ...(formData.role === 'GURU' && { nip: formData.nip }),
        ...(formData.classId && { classId: formData.classId }),
        ...(formData.role === 'ORANGTUA' && {
          parentData: {
            childrenNisn: formData.childrenNisn.filter(nisn => nisn.trim())
          }
        })
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Registrasi berhasil! Menunggu persetujuan admin. Anda akan diarahkan ke halaman login.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'Terjadi kesalahan saat registrasi');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akun</h1>
          <p className="text-gray-600">Buat akun baru untuk sistem point siswa</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Daftar Sebagai
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <label key={role.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{role.icon}</span>
                        <span className="font-medium text-gray-900">{role.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan email"
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === 'SISWA' && (
              <div>
                <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-2">
                  NISN
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="nisn"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan NISN"
                  />
                </div>
              </div>
            )}

            {formData.role === 'GURU' && (
              <div>
                <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-2">
                  NIP
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="nip"
                    name="nip"
                    value={formData.nip}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan NIP"
                  />
                </div>
              </div>
            )}

            {formData.role === 'ORANGTUA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NISN Anak
                </label>
                <div className="space-y-3">
                  {formData.childrenNisn.map((nisn, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={nisn}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChildrenNisnChange(index, e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={`NISN anak ${index + 1}`}
                        />
                      </div>
                      {formData.childrenNisn.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChildNisn(index)}
                          className="px-3 py-3 text-red-500 hover:text-red-700 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChildNisn}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    + Tambah Anak
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ulangi password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error/Success Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                'Daftar Akun'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}