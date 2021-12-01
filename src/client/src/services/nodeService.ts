import axios from "axios"
import { INode } from "../types"
import { Node } from "react-flow-renderer";
export const baseUrl = "/api/node"

// Should be possible to give "getAll" a return type
const getAll  = async (): Promise<INode[]> => {
  const node = await axios.get<INode[]>(baseUrl)
  return node.data
}

//What is the actual type? We are sending a JSON to the backend and
//then return an object
const sendNode = async(node: INode): Promise<string> => {
  const response = await axios.post(baseUrl, node)
  //Return the id for that element created by the database
  return response.data.rows[0].id
}

//deletes node from db then return an object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteNode = async(node: Node<any>): Promise<{msg: string}> => {
  const response = await axios.delete(`${baseUrl}/${node.id}`)
  console.log("Node deleted", response.data)
  return response.data
}

export {
  getAll,
  sendNode,
  deleteNode
}