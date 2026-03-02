import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Sparkles, Globe, Users, ArrowLeft } from 'lucide-react';
import type { EventResponse } from '../types';
import { getPublicEventDetails } from '../api/eventApi';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicEventDetails(Number(id));
        if (!data) {
          setError('Événement introuvable');
        } else {
          setEvent(data);
        }
      } catch (err: any) {
        console.error('Erreur fetching event details:', err);
        setError(err?.message || 'Erreur lors du chargement de l\'événement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const start = event?.startAt ? new Date(event.startAt) : undefined;

  return (
    <div className="event-details-page">
      <div className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="header-badge">
              <Sparkles size={16} />
              <span>Événements Professionnels</span>
            </div>
            <h1>Détails de l'événement</h1>
            <p className="header-subtitle">Informations et modalités d'inscription</p>
          </div>
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="loading-message">
            <div className="spinner" />
            <p>Chargement de l'événement...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <Link to="/events" className="btn btn-outline">Retour</Link>
          </div>
        )}

        {event && (
          <div className="event-detail-card">
            {/* Header avec image de couverture */}
            {event.coverImageUrl && (
              <div className="event-cover-full">
                <img src={event.coverImageUrl} alt={event.title} />
                <div className="event-cover-overlay">
                  <Calendar size={48} />
                </div>
              </div>
            )}

            {/* En-tête de l'événement */}
            <div className="event-detail-header">
              <div className="event-status-badge">
                {start && new Date() < start ? (
                  <>
                    <Clock size={16} />
                    <span>À venir</span>
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    <span>En cours</span>
                  </>
                )}
              </div>
              <h2>{event.title}</h2>
              
              {/* Métadonnées */}
              <div className="event-meta-info">
                <div className="meta-info-item">
                  <Calendar size={18} />
                  <span>{start ? start.toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Date à définir'}</span>
                </div>
                <div className="meta-info-item">
                  <Clock size={18} />
                  <span>{start ? start.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : 'Heure à définir'}</span>
                </div>
                <div className="meta-info-item">
                  {event.online ? <Globe size={18} /> : <MapPin size={18} />}
                  <span>
                    {event.online 
                      ? 'En ligne' 
                      : `${event.locationName || 'Lieu'}${event.city ? ' • ' + event.city : ''}`
                    }
                  </span>
                </div>
                <div className="meta-info-item">
                  <Users size={18} />
                  <span>Ouvert à tous</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="event-detail-section">
              <h3>
                <Calendar size={20} />
                <span>À propos de l'événement</span>
              </h3>
              <div className="event-description-rich">
                <p>{event.description}</p>
              </div>
            </div>

            {/* Lieu / Modalités */}
            {(event.online && event.onlineUrl) && (
              <div className="event-detail-section">
                <h3>
                  <Globe size={20} />
                  <span>Modalités de participation</span>
                </h3>
                <div className="event-online-info">
                  <p>Cet événement se déroule en ligne.</p>
                  <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className="event-link">
                    {event.onlineUrl}
                  </a>
                </div>
              </div>
            )}

            {(!event.online && (event.locationName || event.city)) && (
              <div className="event-detail-section">
                <h3>
                  <MapPin size={20} />
                  <span>Lieu</span>
                </h3>
                <div className="event-location-info">
                  {event.locationName && <p><strong>{event.locationName}</strong></p>}
                  {event.city && <p>{event.city}</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="event-detail-actions">
              <Link to="/events" className="btn btn-outline">
                <ArrowLeft size={18} />
                Retour aux événements
              </Link>
              <button className="btn btn-primary">
                <Users size={18} />
                S'inscrire à l'événement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
