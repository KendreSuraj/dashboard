import React, { useEffect } from 'react'
import TableComponent from '../../components/common/TableComponent/TableComponent'
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCenter } from '../../store/actions/center.action';
import { hasAdminAndSuperAdminAccess } from '../../components/common/UserRolesConfig';

const CenterListing = () => {
  const role = JSON.parse(localStorage.getItem('userData'))?.user?.role;
  const navigate = useNavigate()
  const dispatch = useDispatch()
  let centerList = useSelector(state => state.center?.centerList?.centers)
     
  centerList = centerList?.map((data) => {
    return {
      'Id':data?.id,
      'Center Phone':data?.phone,
      'center Name':data?.name ,
      'Admin Name': data?.adminName,
      "Admin Phone": data?.adminPhone,
      'Admin User Id': data?.adminUserId,
      'City Id': data.cityId,
      'Start Time':data?.timings?.startTime,
      'End Time':data?.timings?.endTime,
       'Address':data?.location,
       'lat':data?.lat,
       'long':data?.long
    };
  });
  
  const handleEdit = (data) => {
    if (data) {
      navigate("/addedit-center", {
        state: { data: { data } },
      });
    }
  };
  useEffect(() => {
    dispatch(fetchCenter())
  }, [dispatch])

  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: "30px" }}>
        <h3 style={{ margin: '0 auto' }}>All Centers</h3>
        {hasAdminAndSuperAdminAccess(role)&&<Button variant="contained" color="primary" onClick={() => navigate("/addedit-center")}>Add Center</Button>}
      </div>
      <TableComponent data={centerList}
        hiddenFields={["timings"]}
        viewButton={hasAdminAndSuperAdminAccess(role)&&<EditIcon />}
        viewDetails={handleEdit}
      />
    </div>
  )
}

export default CenterListing