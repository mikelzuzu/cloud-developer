import HttpException from "./HttpException";
 
class TodoNotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `Todo with id ${id} not found for given user. Please make sure Todo exists and belongs to the user.`);
  }
}
 
export default TodoNotFoundException;