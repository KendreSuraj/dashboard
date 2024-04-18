import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_SCHEDULER_API_URL;

export const fetchTherapist = createAsyncThunk('therapist', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${apiUrl}/api/v1/therapist/get-all-therapists`);
    console.log("see therapisrt ------>>>>>",res)
    return res?.data;
  } catch (error) {
    console.error('Error in fetchMachine:', error);
    return rejectWithValue('Failed to fetch Machines. Please try again later.');
  }
});


export const addTherapist = async (data) => {
    console.log("dtaa for therpist------->>>>>>", data)
    try {
      const res = await axios.post(`${apiUrl}/api/v1/therapist/add-therapist`, data);
      console.log("Therapist adde4dd   successfully!---->>>>", res);
      return res;
    } catch (error) {
      console.error("Error adding center:", error);
      return error;
    }
  
  };