import {labels} from '../constants';

export default function JobStatusButton({value,className='state'}){
 return <span className={`${className} ${value}`}>{labels[value]||value}</span>;
}
