import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { List, ListItem, ListItemText, Divider } from '@mui/material';
import moment from 'moment';

export default function TransactionHistoryDialog({ open, setOpen, paymentLog = [] }) {
  const handleClose = () => setOpen(false);


  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Transaction History</DialogTitle>
      <DialogContent>
        {(!paymentLog || paymentLog.length === 0) && <div style={{ padding: 12 }}>No transactions yet.</div>}
        {paymentLog && paymentLog.length > 0 && (
          <List>
            {paymentLog.map((p, idx) => (
              <React.Fragment key={idx}>
                <ListItem>
                  <ListItemText
                    primary={`Amount: ${p.paidAmount || 0}`}
                    secondary={`Date: ${p.paymentDate ? moment(p.paymentDate).format('DD/MM/YYYY HH:mm') : 'N/A'} | Receiver: ${p.receiveBy?.name || 'N/A'}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
