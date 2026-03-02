import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Globe, Building, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EventResponse } from '../types';
import { listPublicEvents } from '../api/eventApi';

const Events = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'online' | 'onsite' | 'upcoming'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listPublicEvents();
        setEvents(data);
      } catch (err: any) {
        console.error('Erreur loading public events:', err);
        setError(err?.message || 'Erreur lors du chargement des événements');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    const eventDate = event.startAt ? new Date(event.startAt) : null;
    const now = new Date();
    const isUpcoming = eventDate && eventDate > now;

    if (filterType === 'online') return event.online;
    if (filterType === 'onsite') return !event.online;
    if (filterType === 'upcoming') return isUpcoming;
    return true;
  });

  // Calculer les stats
  const stats = {
    total: events.length,
    online: events.filter(e => e.online).length,
    onsite: events.filter(e => !e.online).length,
    thisMonth: events.filter(e => {
      if (!e.startAt) return false;
      const eventDate = new Date(e.startAt);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Déterminer le statut de l'événement
  const getEventStatus = (event: EventResponse) => {
    if (!event.startAt) return 'upcoming';
    const eventDate = new Date(event.startAt);
    const now = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'passed';
    if (diffDays <= 7) return 'soon';
    return 'upcoming';
  };

  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case 'soon':
  //       return <span className="event-badge event-badge-soon">Bientôt</span>;
  //     case 'upcoming':
  //       return <span className="event-badge event-badge-upcoming">À venir</span>;
  //     case 'passed':
  //       return <span className="event-badge event-badge-passed">Terminé</span>;
  //     default:
  //       return null;
  //   }
  // };

  return (
    <div className="events-page">
      {/* Header */}
      <div className="events-header">
        <div className="container">
          <div className="events-header-content">
            <div className="events-badge">
              <Sparkles size={16} />
              <span>Événements Professionnels</span>
            </div>
            <h1>Développez votre réseau</h1>
            <p>Participez à nos événements et rencontrez des professionnels de votre domaine</p>
          </div>
        </div>
      </div>

      <div className="container">

        {/* Liste des événements */}
        <div className="events-grid">
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Chargement des événements...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Aucun événement trouvé</p>
            </div>
          )}

          {!loading && !error && filteredEvents.map(ev => {
            const start = ev.startAt ? new Date(ev.startAt) : undefined;
            const status = getEventStatus(ev);
            
            return (
              <div key={ev.id} className="event-card">
                <div className="event-date-badge">
                  <div className="date-day">{start ? start.getDate() : '?'}</div>
                  <div className="date-month">{start ? start.toLocaleDateString('fr-FR', { month: 'short' }) : ''}</div>
                </div><br />

                <div className="event-card-content">
                  <div className="event-header">
                    <h3>{ev.title}</h3>
                    {/* {getStatusBadge(status)} */}
                  </div>

                  <p className="event-description">{ev.description}</p>

                  <div className="event-details">
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{start ? start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date à définir'}</span>
                    </div>
                    <div className="event-detail">
                      {ev.online ? <Globe size={16} /> : <MapPin size={16} />}
                      <span>
                        {ev.online 
                          ? (ev.onlineUrl ? `En ligne` : 'En ligne') 
                          : `${ev.locationName ? ev.locationName : ''}${ev.city ? ' • ' + ev.city : ''}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="event-footer">
                    <Link to={`/events/${ev.id}`} className="btn btn-primary">
                      Voir les détails
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Events;
