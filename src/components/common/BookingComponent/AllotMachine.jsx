import React, { useEffect, useState } from 'react';
import { Paper, Button, FormControl, TextareaAutosize, TextField, MenuItem, Grid, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { deAllocateMachine, fetchAvailableMachine, fetchMachine, manualAllocateMachine, reAllocateMachine } from '../../../store/actions/machine.action';
import { hasAdminAndSuperAdminAccess } from '../UserRolesConfig';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCenter } from '../../../store/actions/center.action';
import { addBookingActionLog } from '../../../store/actions/booking.action';

const AllotMachine = ({ body, isDisabled }) => {
  const role = JSON.parse(localStorage.getItem('userData'))?.user?.role;
  const user = JSON.parse(localStorage.getItem('userData'))?.user;
  const dispatch = useDispatch()
  const availableMachines = useSelector(state => state.machine?.availableMachine)
  const availableMachine = [...availableMachines, body?.previousMachineId]
  const allMachine = useSelector(state => state.machine?.machineList?.machines)
  let centerList = useSelector(state => state.center?.centerList?.centers)
  const [selectedMachine, setSelectedMachine] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(body?.machineCenterId)
  useEffect(() => {
    dispatch(fetchMachine())
    setSelectedMachine(body?.previousMachineId || '')
    if (body?.slotTime?.startTime) {
      let newBody = {
        ...body,
        centerId: selectedCenter
      }
      dispatch(fetchAvailableMachine(newBody))
    }
    dispatch(fetchCenter())
  }, [dispatch, selectedCenter])
  const handleMachineChange = (event) => {
    setSelectedMachine(event.target.value);
  }
  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value)
  } 
  const addUserActivity = async (data) => {
    const body1={
      session_schedule_id:body?.sessionScheduleId,
      dashboard_user_id:user?.id,
      dashboard_user_name:user?.name,
      operation_type:data.operation_type,
      operation_string:data.operation_string,
    }
    try {
        await addBookingActionLog(body1);
    } catch (error) {
        console.error("Error adding user log:", error);
    }
};
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const isConfirmed = window.confirm('Are you sure you want to submit?');
      if (isConfirmed) {
        setIsButtonDisabled(true);
        const newBody = {
          ...body,
          newMachineId: selectedMachine,
          centerId: selectedCenter
        };
        const res = await manualAllocateMachine(newBody);
        if (res?.status === 200) {
          addUserActivity({
            operation_string: `Dashboard user ${user?.name} manually allocated machine.`,
            operation_type: "manually-allocate-machine"
        });        
          alert(res.data?.status?.message);
          window.location.reload();
        } else {
          alert("An error occurred while Allocating Machine.")
          setIsButtonDisabled(false);
        }
      }
    } catch (error) {
      setIsButtonDisabled(false);
      console.error('An error occurred while handling the submission:', error);
    }
  };


  const reAllocateMachineManual = async () => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to Reallocate Machine?');
      if (isConfirmed) {
        setIsButtonDisabled(true);
        const res = await reAllocateMachine({ ...body, centerId: selectedCenter });
        if (res?.status === 200) {
          addUserActivity({
            operation_string: `Dashboard user ${user?.name} reallocated machine.`,
            operation_type: "reallocate-machine"
        });        
          alert(res.data?.status?.message);
          window.location.reload();
        } else {
          alert(res?.response?.data?.status?.message);
          setIsButtonDisabled(false);
        }
      }
    } catch (error) {
      setIsButtonDisabled(false)
      alert('An error occurred while reallocating the machine. Please try again later.');
    }
  };

  const deAllocateMachineForBooking = async () => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to Deallocate Machine?');
      if (isConfirmed) {
        setIsButtonDisabled(true);
        const reqBody = {
          sessionScheduleId: body?.sessionScheduleId,
          date: body?.slotDate,
          machineId: body?.machineId
        }
        const res = await deAllocateMachine(reqBody);
        if (res?.status === 200) {
          addUserActivity({
            operation_string: `Dashboard user ${user?.name} deallocated machine.`,
            operation_type: "deallocate-machine"
        });        
          alert(res.data?.status?.message);
          window.location.reload();
        } else {
          setIsButtonDisabled(false);
          alert('An error occurred while Deallocating Machien. Please try again later.');
          return res;
        }
      }
    } catch (error) {
      setIsButtonDisabled(false);
      alert('An error occurred while  Deallocating Machine. Please try again later.');
    }
  };

  return (
    <>
      <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Allot  Machine</h3>
        <Box display="flex" alignItems="center" gap={10}>
          <TextField
            select
            label="Choose Center"
            fullWidth
            margin="normal"
            value={selectedCenter}
            onChange={handleCenterChange}
            disabled={isDisabled}
            required
            sx={{
              '.MuiInputBase-root': {
                height: 41,
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
          {hasAdminAndSuperAdminAccess(role) && <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={isDisabled || isButtonDisabled}
            style={{ float: 'right', textTransform: 'none' }} onClick={() => reAllocateMachineManual()}>
            {isButtonDisabled ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Re Allocate Machine'
            )}
          </Button>}
        </Box>
        <form>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11}>
              <TextField
                select
                label="Machines"
                fullWidth
                margin="normal"
                value={selectedMachine}
                onChange={handleMachineChange}
                disabled={isDisabled}
                required
              >
                {availableMachine && availableMachine.length > 0 ? (
                  allMachine?.filter(machine => availableMachine.includes(machine.id)).map((machine) => (
                    <MenuItem
                      // value={`${machine.id} - ${machine.name}`}
                      value={machine.id}
                      key={machine.id}
                    >
                      {machine.id} - {machine.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="value">Enter</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={1}>
              {(body?.machineId && !isDisabled)&& <DeleteIcon onClick={() => deAllocateMachineForBooking()} />}
            </Grid>
            <Grid item xs={12}>
              {hasAdminAndSuperAdminAccess(role) && <Button
                variant="contained"
                color="primary"
                type="submit"
                onClick={handleSubmit}
                disabled={isDisabled || isButtonDisabled}
              >
                {isButtonDisabled ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Submit'
                )}
              </Button>}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}

export default AllotMachine;