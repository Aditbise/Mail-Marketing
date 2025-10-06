import {SortableContext,verticalListSortingStrategy} from "@dnd-kit/sortable";
import {EmailBuilderTask} from "./EmailBuilderTask";
export const EmailBuilderColumn = ({ task }) => {
  return (
    <div className={"email-builder-column"}>
        <SortableContext items={task} 
        strategy={verticalListSortingStrategy}>
        {task.map((item) => (
            <EmailBuilderTask id={item.id} title={item.title} key={item.id}
            />
        ))}
      </SortableContext>
    </div>
  );
};