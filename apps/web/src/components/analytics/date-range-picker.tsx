'use client';

import { Box, Button, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const setQuickRange = (days: number) => {
    const end = dayjs();
    const start = end.subtract(days, 'day');
    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
      <DatePicker
        label="Start Date"
        value={startDate}
        onChange={onStartDateChange}
        slotProps={{ textField: { size: 'small' } }}
      />
      <DatePicker
        label="End Date"
        value={endDate}
        onChange={onEndDateChange}
        slotProps={{ textField: { size: 'small' } }}
      />
      <Button size="small" onClick={() => setQuickRange(7)}>
        7 Days
      </Button>
      <Button size="small" onClick={() => setQuickRange(30)}>
        30 Days
      </Button>
      <Button size="small" onClick={() => setQuickRange(90)}>
        90 Days
      </Button>
    </Stack>
  );
}

