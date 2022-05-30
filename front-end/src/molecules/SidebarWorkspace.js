import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";

import { AddWorkspaceIcon } from "../atoms/icons";
import SidebarWorkspaceItem from "../atoms/SidebarWorkspaceItem";
import WorkspaceSettings from "../organisms/WorkspaceSettings";
import { addNewWorkspace, getCollabWorkspaces, getOwnedWorkspaces, updateAccountWorkspaces } from "../util/requests";
import "./SidebarWorkspace.css";


const componentName = "SidebarWorkspace";
function SidebarWorkspace( {onSelectWorkspace, accountId} ) {  
  
  const [ showAddWorkspace, setShowAddWorkspace ] = useState(false);
  const [ workspaceList, setWorkspaceList ] = useState([]);
  const [ showWorkspaceSettingPopup, setShowWorkspaceSettingPopup ] = useState(false);

  const { user } = useAuth0();
  const [ editingWorkspaceId, setEditingWorkspaceId ] = useState();
  const [ currentWorkspaceId, setCurrentWorkspaceId ] = useState("");

  // Updates which workspace is highlighted and selected in the dashboard
  const updateSelectedWorkspace = workspaceId =>{
    setCurrentWorkspaceId(workspaceId);
    setEditingWorkspaceId(workspaceId);
    onSelectWorkspace(workspaceId);
    localStorage.setItem("currentWorkspaceId", workspaceId);
  };

  const handleWorkspaceSubmit = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const response = await addNewWorkspace(e.target.value, accountId);
      const newWorkspaceList = [response.data, ...workspaceList];
      setWorkspaceList(newWorkspaceList);

      let workspaceIds = newWorkspaceList.map(workspace => workspace._id);
      updateAccountWorkspaces(accountId, workspaceIds);
      window.location.reload(false);  // to update extension with new workspace
      e.target.value = "";
      setShowAddWorkspace(false);
      updateSelectedWorkspace(response.data._id);
    }
  };

  const addWorkspaceInput = showAddWorkspace ?
    <div className={`${componentName}-add`}>
      <input 
        type="text" 
        autoFocus 
        placeholder="Enter Workspace Name"
        className={`${componentName}-add-input`}
        onKeyPress={(e) => handleWorkspaceSubmit(e)}/>
    </div> 
    : <></>;

  const handleAddWorkspace = () => setShowAddWorkspace(prevShow => !prevShow);

  const handleOnWorkspaceEdit = workspaceId => {
    setShowWorkspaceSettingPopup(true);
    updateSelectedWorkspace(workspaceId);
  };

  const handleOnChangeVisibility = (visible) => setShowWorkspaceSettingPopup(visible);

  const renderList = () => (
    workspaceList && workspaceList.map( ({_id, name}) => 
      <SidebarWorkspaceItem key={_id} id={_id} selected={_id === currentWorkspaceId} name={name} onEdit={() => handleOnWorkspaceEdit(_id)} onClickWorkspace={updateSelectedWorkspace}/>)
  );

  useEffect( async () => {
    if (accountId) {
      let ownedWorkspaces = await getOwnedWorkspaces(accountId);
      let collabWorkspaces = await getCollabWorkspaces(user.email);
      let workspaces = (ownedWorkspaces.data).concat(collabWorkspaces.data);
    
      setWorkspaceList(workspaces);
    }
  }, [accountId]); 

  useEffect(() => {
    if (workspaceList.length > 0){

      var retrievedWorkspace = localStorage.getItem("currentWorkspaceId");
      if (retrievedWorkspace == null) {
        localStorage.setItem("currentWorkspaceId" , workspaceList[0]._id);
      }

      retrievedWorkspace = localStorage.getItem("currentWorkspaceId");
      onSelectWorkspace(retrievedWorkspace);
      setCurrentWorkspaceId(retrievedWorkspace);
    } // else, do not show any workspace because there aren't any workspaces
  }, [workspaceList]);

  useEffect(() => {
    if (currentWorkspaceId != "") {
      onSelectWorkspace(currentWorkspaceId);
      setEditingWorkspaceId(currentWorkspaceId);
      localStorage.setItem("currentWorkspaceId", currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  const header = <div className={`${componentName}-header`}>
    <span>My Workspaces</span>
    <AddWorkspaceIcon className={`${componentName}-add-icon`} onClick={handleAddWorkspace}/>
  </div>;

  return (
    <div className={`${componentName}`}>
      {header}
      {addWorkspaceInput}
      {renderList()}
      {/* Workspace Settings Pop Up */}
      { showWorkspaceSettingPopup && <WorkspaceSettings workspaceId={editingWorkspaceId} onChangeVisibility={(visible) => handleOnChangeVisibility(visible)}/>}
    </div>
  );
}

SidebarWorkspace.propTypes = {
  onSelectWorkspace: PropTypes.func.isRequired,
  accountId: PropTypes.string.isRequired
};


export default SidebarWorkspace;