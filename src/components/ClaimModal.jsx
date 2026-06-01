import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import styles from './ClaimModal.module.css';

const ClaimModal = ({ institutionId, institutionName, onClose }) => {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('You must be logged in to claim an institution.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'claims'), {
        institutionId,
        institutionName,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        workEmail: email,
        claimedRole: role,
        proofLink,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('Failed to submit your claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className={styles.title}>Claim this Listing</h2>
        <p className={styles.subtitle}>
          Verify your association with <strong>{institutionName}</strong> to manage its profile and post jobs.
        </p>

        {success ? (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', fontWeight: '600' }}>
            Claim submitted successfully! Our team will review it shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="role">Your Role at Institution</label>
              <input
                type="text"
                id="role"
                required
                className={styles.input}
                placeholder="e.g., Principal, HR Manager, Admin"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">Official Work Email</label>
              <input
                type="email"
                id="email"
                required
                className={styles.input}
                placeholder="e.g., admin@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="proofLink">Verification Link</label>
              <input
                type="url"
                id="proofLink"
                required
                className={styles.input}
                placeholder="e.g., LinkedIn Profile or School Website Team Page"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClaimModal;
