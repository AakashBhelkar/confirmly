'use client';

import { Box, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { Order } from '../../lib/api/orders';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

export function OrderTimeline({ order }: { order: Order }) {
  const events = [
    {
      label: 'Order Created',
      time: new Date(order.createdAt),
      icon: <PendingIcon />,
      color: 'primary' as const,
    },
    ...(order.confirmations || []).map((conf: any) => ({
      label: `Confirmation sent via ${conf.channel}`,
      time: new Date(conf.sentAt),
      icon: <CheckCircleIcon />,
      color: 'success' as const,
    })),
    {
      label: `Order ${order.status}`,
      time: new Date(order.updatedAt),
      icon: order.status === 'confirmed' ? <CheckCircleIcon /> : <CancelIcon />,
      color: order.status === 'confirmed' ? ('success' as const) : ('error' as const),
    },
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <Timeline>
      {events.map((event, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color={event.color}>{event.icon}</TimelineDot>
            {index < events.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {event.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {event.time.toLocaleString()}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

