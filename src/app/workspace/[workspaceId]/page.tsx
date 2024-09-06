import React from "react";

interface WorkSpaceIdPageProps {
  params: { workspaceId: string };
}
const WorkspaceIdPage = ({ params: { workspaceId: id } }: WorkSpaceIdPageProps) => {
  return <div>ID:{id}</div>;
};

export default WorkspaceIdPage;
