type Status = "Done" | "Doing" | "ToDo"

// Id of a node is optional since the id is created in the database
// so when sent to backend we don't give it any id

export interface INode {
  description: string,
  status: Status,
  priority: string,
  id?: string, //Could there be a more specific ID than just number?
  x: number,
  y: number
}

export interface IEdge {
  source_id: string
  target_id: string
}