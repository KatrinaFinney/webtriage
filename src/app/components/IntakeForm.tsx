'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/IntakeForm.module.css';
import { motion } from 'framer-motion';

interface IntakeFormProps {
  onSuccess?: () => void;
}

export default function IntakeForm({ onSuccess }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    issue: '',
    urgency: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (status === 'success' && onSuccess) {
      const timer = setTimeout(onSuccess, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Request Website Triage</h2>

      {status === 'success' ? (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              display: 'inline-block',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              color: 'white',
              fontSize: '2rem',
              lineHeight: '60px',
              fontWeight: 700,
            }}
          >
            ✓
          </motion.div>
          <p style={{ marginTop: '1rem', color: '#38bdf8' }}>
            We&rsquo;ll be in touch shortly to schedule your triage.
          </p>
        </div>
      ) : (
        <>
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            type="text"
            name="website"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={handleChange}
            required
          />

          <textarea
            className={styles.textarea}
            name="issue"
            placeholder="Briefly describe the issue"
            value={formData.issue}
            onChange={handleChange}
            rows={3}
            required
          />

          <select
            className={styles.input}
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
          >
            <option value="">Select urgency level</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Moderate">Moderate</option>
          </select>

          <button
            className={styles.button}
            type="submit"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Sending...' : 'Submit Request'}
          </button>

          {status === 'error' && (
            <p style={{ marginTop: '1rem', color: '#f87171' }}>
              Something went wrong. Please try again.
            </p>
          )}
        </>
      )}
    </form>
  );
}
