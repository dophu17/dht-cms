import React, { Component } from 'react';
import axios from 'axios'

const students = [
    {id: 1, name: 'Student 1'},
    {id: 2, name: 'Student 2'},
    {id: 3, name: 'Student 3'},
    {id: 4, name: 'Student 4'}
]
const listStudents = students.map((student, key) =>
    <tr key={key}>
        <td>{student.id}</td>
        <td>{student.name}</td>
    </tr>
);

class SayHello extends Component {
    constructor() {
        super()
        this.state = {
            users: []
        }
        this.getUser()
    }

    getUser() {
        axios.get('http://localhost:2000/user')
        .then(function (res) {
            const users = res.data.lists
            console.log(res)
            console.log(users)
            this.setState({
                users: users
            })
            console.log('this.state.users')
            console.log(this.state.users)
        }).catch(function (err) {
            console.log(err)
        });
    }

    renderUser() {
        console.log(this.state)
        if ( this.state.users ) {
            return this.state.users.map((user, index) => {
                <tr key={index}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                </tr>
            })
        }
    }

    render() {
        return (
        <div>
            <h3>Say Hello</h3>
            
            <div className="row">
                <div className="col-md-6">
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listStudents}
                        </tbody>
                    </table>
                </div>
                
                <div className="col-md-6">
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderUser()}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
        );
    }
}

export default SayHello;
