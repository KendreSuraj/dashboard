import React, { useEffect, useState } from 'react';
import { Paper, TextField, Button, MenuItem } from '@mui/material';
import moment from 'moment';
import { getHoursList, getMinutesList } from '../../../utils';

import {
  confirmClientSlots,
  getClientSlots,
} from '../../../store/actions/therapist.action';
import CircularProgress from '@mui/material/CircularProgress';
import { useParams } from 'react-router-dom';
import { hasAdminAndSuperAdminAccess } from '../UserRolesConfig';
import { useSelector } from 'react-redux';
import { addBookingActionLog } from '../../../store/actions/booking.action';
const AllotDateV2 = (props) => {
  const role = JSON.parse(localStorage.getItem('userData'))?.user?.role;
  const user = JSON.parse(localStorage.getItem('userData'))?.user;
  const [activeOption, setActiveOption] = useState(null);
  const [activeOption1, setActiveOption1] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const clientInfo = props?.body;
  const [timeSlot, setTimeSlot] = useState([]);
  const params = useParams();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const addUserActivity = async (data) => {
    const body = {
      session_schedule_id: params?.sessionScheduleId,
      dashboard_user_id: user?.id,
      dashboard_user_name: user?.name,
      operation_type: data.operation_type,
      operation_string: data.operation_string,
    }
    try {
      await addBookingActionLog(body);
    } catch (error) {
      console.error("Error adding user log:", error);
    }
  };
  let centerList = useSelector((state) => state.center?.centerList?.centers);
  useEffect(() => {
    setBooking((prevBooking) => ({
      ...prevBooking,
      previousSlotDate: clientInfo?.slotDate,
      previousSlotTime: clientInfo?.slotTime,
      city: clientInfo.city,
      productId: clientInfo?.productId,
      clientLat: clientInfo?.clientLat,
      clientLong: clientInfo?.clientLong,
      sessionScheduleId: params?.sessionScheduleId,
    }));
  }, [params, clientInfo]);
  const [booking, setBooking] = useState({
    newSlotDate: '',
    newSlotTime: {
      startTime: '',
      endTime: '',
    },
    previousSlotDate: '',
    previousSlotTime: '',
    productId: '',
    clientLat: '',
    clientLong: '',
    sessionScheduleId: '',
  });
  const getTimeSlots = async (date, index) => {
    try {
      setIsLoading(true);
      setActiveOption(index);
      setBooking((prevBooking) => ({ ...prevBooking, newSlotDate: date }));

      const requestData = {
        slotDate: date,
        city: clientInfo?.city,
        productId: clientInfo?.productId,
        clientLat: clientInfo?.clientLat,
        clientLong: clientInfo?.clientLong,
        clientId: clientInfo?.clientId,
        isDashboard: true,
        centerId: selectedCenter || null,
      };
      const response = await getClientSlots(requestData);
      if (response?.status === 200) {
        setIsLoading(false);
        const currentDate = new Date();
        const currentTime = currentDate.toTimeString().slice(0, 5);
        let currentSlots = response?.data?.slots
        if (currentDate.toISOString().slice(0, 10) === date) {
          currentSlots = currentSlots.filter(slot => slot.clientSlotEndTime > currentTime);
        }
        setTimeSlot(
          currentSlots.sort((a, b) => {
            return a.clientSlotStartTime.localeCompare(b.clientSlotStartTime);
          }),
        );
      } else {
        console.error('Failed to fetch time slots:', response?.status);
      }
    } catch (error) {
      console.error('An error occurred while fetching time slots:', error);
    }
  };

  function getNextSevenDays(today) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      dates.push({ id: i + 1, date: formattedDate });
    }
    return dates;
  }
  const confirmBookingSlot = async (item, index) => {
    setActiveOption1(index);
    setBooking((prevBooking) => ({
      ...prevBooking,
      newSlotTime: {
        startTime: item.clientSlotStartTime,
        endTime: item.clientSlotEndTime,
      },
      centerId: selectedCenter || null,
    }));
  };
  //   const handleSlotConfirmation = async () => {
  //     if (!booking?.newSlotTime.startTime) {
  //       alert('Please Select Booking time ');
  //     }
  //     const res = await confirmClientSlots(booking);
  //     if (res.status === 200) {
  //       alert(res.data?.status?.message);
  //       window.location.reload();
  //     }
  //   };

  const handleSlotConfirmation = async () => {
    if (!booking?.newSlotTime?.startTime) {
      alert('Please Select Booking time ');
      return;
    }
    const isConfirmed = window.confirm(
      'Are you sure you want to Confirm slot?',
    );
    if (isConfirmed) {
      try {
        setIsButtonDisabled(true);
        const res = await confirmClientSlots(booking);
        if (res.status === 200) {
          addUserActivity({
            operation_string: `Dashboard user ${user?.name} rescheduled this booking  .`,
            operation_type: "rescheduled"
          });
          alert(res.data?.status?.message);
          window.location.reload();
        }
      } catch (error) {
        console.error(
          'An error occurred while handling the submission:',
          error,
        );
        setIsButtonDisabled(false);
      }
    }
  };

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
    setActiveOption(null);
    setActiveOption1(null);
    setTimeSlot([]);
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Appointment Date</h1>
      <div>
        <h3>Select A Date</h3>

        <TextField
          select
          label="Choose Center"
          fullWidth
          margin="normal"
          value={selectedCenter}
          onChange={handleCenterChange}
          disabled={props.isDisabled}
          required
          sx={{
            '.MuiInputBase-root': {
              height: 50,
            },
            '.MuiInputLabel-root': {
              fontSize: 12,
            },
            '.MuiMenuItem-root': {
              fontSize: 12,
            },
          }}
        >
          {centerList && centerList.length > 0 ? (
            centerList.map((center) => (
              <MenuItem value={center.id} key={center.id}>
                {center.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="value">Enter</MenuItem>
          )}
        </TextField>
        <div style={{ textAlign: 'center' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {getNextSevenDays(new Date())?.map((item, index) => (
              <li
                key={index}
                style={{
                  display: 'inline-block',
                  margin: '5px',
                  cursor: 'pointer',
                  background: activeOption === index ? '#ccc' : 'transparent',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  border: '1px solid #ccc',
                }}
                onClick={() => getTimeSlots(item.date, index)}
              >
                <span>
                  {moment(item.date, 'YYYY-MM-DDT.SSS[Z]').format(`ddd DD`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ margin: '30px' }}>
          {isLoading && <CircularProgress />}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {!isLoading && timeSlot?.length > 0 ? (
            <>
              <h3 style={{ fontWeight: 'bold' }}>Select Start Time</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {timeSlot.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'inline-block',
                      margin: '5px',
                      cursor: 'pointer',
                      background:
                        activeOption1 === index ? '#ccc' : 'transparent',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      border: '1px solid #ccc',
                    }}
                    onClick={() => confirmBookingSlot(item, index)}
                  >
                    <span>
                      {`${item.clientSlotStartTime}-${item.clientSlotEndTime}`}
                    </span>
                  </li>
                ))}
              </ul>
              {hasAdminAndSuperAdminAccess(role) && (
                <button
                  disabled={props?.isDisabled || isButtonDisabled}
                  style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor:
                      props?.isDisabled || isButtonDisabled ? 'gray' : 'blue',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                  }}
                  onClick={handleSlotConfirmation}
                >
                  {/* Confirm your slot */}
                  {isButtonDisabled ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Confirm your slot'
                  )}
                </button>
              )}
            </>
          ) : (
            <h3>
              {!isLoading &&
                timeSlot?.length === 0 &&
                'Please Select Booking date'}
            </h3>
          )}
        </div>
      </div>
    </Paper>
  );
};

export default AllotDateV2;
