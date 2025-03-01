// src/components/auth/RegisterForm.tsx - ajustes importantes
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signUp, loading } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
        await signUp(
          formData.email,
          formData.password,
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          }
        );
  
        setSuccessMessage('Registro exitoso. Por favor, verifica tu correo electrónico para confirmar tu cuenta.');
        
        // Redirigir después de un breve retraso
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (error) {
        console.error('Error de registro:', error);
        setError(error.message || 'Error al registrar. Por favor, inténtalo de nuevo.');
      }
    };
    
    try {
      // Registrar al usuario con Supabase Auth
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: 'customer',
        }
      );

      if (signUpError) throw signUpError;

      // Crear perfil de usuario en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: 'customer',
          },
        ]);

      if (profileError) throw profileError;

      setSuccessMessage('Registro exitoso. Por favor, verifica tu correo electrónico para confirmar tu cuenta.');
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Error de registro:', error);
      setError(error.message || 'Error al registrar. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Crear una cuenta</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" cla