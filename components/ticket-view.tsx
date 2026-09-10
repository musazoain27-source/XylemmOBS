import { Badge } from '@/components/ui/badge';
import { dateLabel } from '@/lib/client-api';
import { reference, type Ticket } from '@/lib/types';
export function TicketView({ ticket }: { ticket: Ticket }) {
  return (
    <>
      <div className="ticket-meta">
        <span>{reference(ticket.id)}</span>
        <Badge className={'status-badge status-' + ticket.status}>
          {ticket.status}
        </Badge>
        <span>{ticket.kind === 'issue' ? 'Issue report' : 'Question'}</span>
      </div>
      <h2 className="ticket-title">{ticket.title}</h2>
      <p className="time-label">Submitted {dateLabel(ticket.createdAt)}</p>
      <div className="message-block">
        <span className="section-kicker">ORIGINAL MESSAGE</span>
        <p>{ticket.body}</p>
      </div>
      {(ticket.modVersion ||
        ticket.minecraft ||
        ticket.gpu ||
        ticket.settings) && (
        <dl className="detail-grid">
          {[
            ['Recorder', ticket.modVersion],
            ['Minecraft', ticket.minecraft],
            ['Graphics card', ticket.gpu],
            ['Settings', ticket.settings],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      )}
    </>
  );
}
