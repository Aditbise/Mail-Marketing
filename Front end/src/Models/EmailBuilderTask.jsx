import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
export const EmailBuilderTask=({ id,title })=> {
    const{attributes,listeners,setNodeRef,
        transform,transition}=useSortable({id});
    return <div ref={setNodeRef} 
    {...attributes} 
    {...listeners} 
    style={{transition,
        transform:CSS.Transform.toString(transform)
    }}
    className='email-builder-task'>
        <div className='email-builder-task-title'>
            {title}
        </div>
    </div>;

}
