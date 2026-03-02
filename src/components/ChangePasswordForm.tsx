import React, { useState } from 'react';
import { authApi } from '../api/authApi';

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await authApi.changePassword(
        currentPassword,
        newPassword,
        confirmNewPassword
      );
      setSuccess('Mot de passe modifié avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <h2>Modifier le mot de passe</h2>
      <div className="form-group">
        <label>Mot de passe actuel</label>
        <input
          type="password"
          className="form-control"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Nouveau mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={confirmNewPassword}
          onChange={e => setConfirmNewPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Modification...' : 'Modifier le mot de passe'}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
