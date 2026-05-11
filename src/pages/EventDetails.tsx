import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Sparkles, Globe, Users, ArrowLeft } from 'lucide-react';
import type { EventResponse } from '../types';
import { getPublicEventDetails } from '../api/eventApi';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const EventDetails = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: event?.title || (isEn ? 'Event details' : "Détails de l'événement"),
    description:
      (event?.description || '').slice(0, 200) ||
      (isEn
        ? 'Career event details and registration on SNJobConnect.'
        : "Détails de l'événement et inscription sur SNJobConnect."),
    path: id ? `/events/${id}` : '/events',
    type: 'article',
    jsonLd: event
      ? {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          description: event.description,
          startDate: event.startAt,
          endDate: event.endAt,
          eventAttendanceMode: event.online
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: event.online
            ? {
                '@type': 'VirtualLocation',
                url: event.onlineUrl || `https://snjobconnect.com/events/${event.id}`,
              }
            : {
                '@type': 'Place',
                name: event.locationName || event.city || 'Sénégal',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: event.city,
                  addressCountry: event.countryCode || 'SN',
                },
              },
          organizer: {
            '@type': 'Organization',
            name: 'SNJobConnect',
            url: 'https://snjobconnect.com/',
          },
          url: `https://snjobconnect.com/events/${event.id}`,
        }
      : undefined,
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicEventDetails(Number(id));
        if (!data) {
          setError(isEn ? 'Event not found' : 'Événement introuvable');
        } else {
          setEvent(data);
        }
      } catch (err: any) {
        console.error('Erreur fetching event details:', err);
        setError(err?.message || (isEn ? 'Error while loading event' : 'Erreur lors du chargement de l\'événement'));
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
              <span>{isEn ? 'Professional Events' : 'Événements Professionnels'}</span>
            </div>
            <h1>{isEn ? 'Event details' : 'Détails de l\'événement'}</h1>
            <p className="header-subtitle">{isEn ? 'Information and registration terms' : 'Informations et modalités d\'inscription'}</p>
          </div>
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="loading-message">
            <div className="spinner" />
            <p>{isEn ? 'Loading event...' : 'Chargement de l\'événement...'}</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <Link to="/events" className="btn btn-outline">{isEn ? 'Back' : 'Retour'}</Link>
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
                    <span>{isEn ? 'Upcoming' : 'À venir'}</span>
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    <span>{isEn ? 'Ongoing' : 'En cours'}</span>
                  </>
                )}
              </div>
              <h2>{event.title}</h2>
              
              {/* Métadonnées */}
              <div className="event-meta-info">
                <div className="meta-info-item">
                  <Calendar size={18} />
                  <span>{start ? start.toLocaleDateString(isEn ? 'en-US' : 'fr-FR', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : (isEn ? 'Date to be defined' : 'Date à définir')}</span>
                </div>
                <div className="meta-info-item">
                  <Clock size={18} />
                  <span>{start ? start.toLocaleTimeString(isEn ? 'en-US' : 'fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : (isEn ? 'Time to be defined' : 'Heure à définir')}</span>
                </div>
                <div className="meta-info-item">
                  {event.online ? <Globe size={18} /> : <MapPin size={18} />}
                  <span>
                    {event.online 
                      ? (isEn ? 'Online' : 'En ligne')
                      : `${event.locationName || (isEn ? 'Location' : 'Lieu')}${event.city ? ' • ' + event.city : ''}`
                    }
                  </span>
                </div>
                <div className="meta-info-item">
                  <Users size={18} />
                  <span>{isEn ? 'Open to everyone' : 'Ouvert à tous'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="event-detail-section">
              <h3>
                <Calendar size={20} />
                <span>{isEn ? 'About this event' : 'À propos de l\'événement'}</span>
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
                  <span>{isEn ? 'How to participate' : 'Modalités de participation'}</span>
                </h3>
                <div className="event-online-info">
                  <p>{isEn ? 'This event takes place online.' : 'Cet événement se déroule en ligne.'}</p>
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
                  <span>{isEn ? 'Location' : 'Lieu'}</span>
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
                {isEn ? 'Back to events' : 'Retour aux événements'}
              </Link>
              <button className="btn btn-primary">
                <Users size={18} />
                {isEn ? 'Register for event' : 'S\'inscrire à l\'événement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
