import JobDetailPage from '../pages/JobDetailPage';
import MyJobsPage from '../pages/MyJobsPage';

export default function TechnicianRoutes({jobs,models,selected,onOpen,onBack,onCreate,onChanged}){
 return selected
  ?<JobDetailPage id={selected} models={models} onBack={onBack} onChanged={onChanged}/>
  :<MyJobsPage jobs={jobs} onOpen={onOpen} onCreate={onCreate}/>;
}
