import { useState } from 'react'
// import { useState, useEffect } from 'react'
// import Image from 'next/image'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import useSWR from 'swr'
import axios from 'axios'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Home() {

  const { data, mutate } = useSWR('http://localhost:9090/tasks', fetcher, { refreshInterval: 8000 })
  const [ addTaskTextFieldValue, setAddTaskTextFieldValue ] = useState('');

  if (!data) {
    return <div>Loading...</div>
  }

  const deleteAllTasksHandler = async () => {
    
    const url = 'http://localhost:9090/tasks';
    await axios.delete(url, payload);

    mutate('http://localhost:9090/tasks', [], {
      optimisticData: []
    });

  }

  const addTaskHandler = async (e) => {

    if (addTaskTextFieldValue !== '') {

      // clear the text field
      setAddTaskTextFieldValue('');
      
      // prepare the payload for the req to backend
      const payload = {
        label: addTaskTextFieldValue
      };

      // prepare optimistic data
      const newData = {
        todo: [...data.todo, {id: null, label: addTaskTextFieldValue, done: false}],
        done: data.done
      };

      // console.log(`addTaskHandler - newdata: ${JSON.stringify(newData, null, 2)}`);
      const url = 'http://localhost:9090/tasks';
      await axios.post(url, payload);
      
      // refresh ui
      mutate('http://localhost:9090/tasks', newData, {
        optimisticData: newData
      });

    }

  }

  const patchTaskHandler = async (task, isDone, index) => {

    // prepare payload to send to backend with update
    const payload = {
      id: task.id,
      done: isDone
    };

    // prepare optimistic data
    const newData = {};
    if (isDone) {

      // so the task is done, lets...
      // remove the task from todo
      newData.todo = data.todo.splice(index, 1);
      // and add it to done
      newData.done = [...data.done, task];

    } else {

      // so the task was done, but it's not, lets...
      // remove the task from done
      newData.done = data.done.splice(index, 1);
      // and put it back in todo
      newData.todo = [...data.todo, task];

    }

    const url = 'http://localhost:9090/tasks';
    await axios.patch(url, payload);

    // refresh ui
    mutate('http://localhost:9090/tasks', newData, {
      optimisticData: newData
    });

  }

  const search = async (e) => {

    console.log(`search for ${e?.target?.value}`);
    
    // const url = `http://localhost:9090/tasks`;
    // await axios.get(url);

  }

  return (
    <main className='min-h-screen flex flex-col p-12 sm:p-18 lg:p-24'>

      <div className='w-full mb-8 sm:mb-16 sm:flex sm:flex-row sm:justify-between'>

        <div className='w-full'>
          <h1 className='font-bold text-xl'>Marvelous v2.0</h1>
        </div>
        <div className='w-full text-right'>
          <button className='px-2 py-2 text-sky-500 text-sm rounded hover:underline' onClick={deleteAllTasksHandler} >Delete all tasks</button>
        </div>

      </div>

      <div className='w-full mb-8 sm:flex sm:flex-row sm:gap-x-4 md:gap-x-12 sm:justify-between'>

        <div className='w-full mb-4 justify-between flex sm:justify-start sm:mb-0' id='add-task-wrapper'>
          <input type='text' className='w-full rounded mr-4' id='add-task-field' value={addTaskTextFieldValue} onChange={(e) => {
            setAddTaskTextFieldValue(e.target.value)
          }} />
          <button className='px-4 py-3 bg-blue-400 hover:bg-blue-600 text-white text-sm rounded' id='add-task-btn' onClick={addTaskHandler} >Add</button>
        </div>
        <div className='w-full' id='search-wrapper'>
          <input type='text' className='w-full rounded' id='search-field' placeholder='Search...' onChange={search}/>
        </div>

      </div>

      <div className='w-full sm:flex sm:flex-row-reverse sm:gap-x-4 md:gap-x-12 sm:justify-between'>

        <div className='w-full flex flex-col' id='done-list'>
          <div className='w-full border-b	border-black border-solid' id='done-list-header'>
            <h3>Done</h3>
          </div>
          <div className='w-full flex flex-col py-4 px-2' id='done-list-table'>
            { data?.done?.map((task, i) => (
              <div className='w-full flex flex-row items-start mb-2' key={`done-list-row-${task.id}`} >
                <input type='checkbox' onChange={async (e) => {
                  
                  console.log(`toggled checkbox ${task.id} - ${e.target.checked}`)
                  await patchTaskHandler(task, e.target.checked, i)

                }} defaultChecked={task.done} value={task.id} className='mt-0.5 mr-2 rounded' />
                <p className='text-sm'>{task.label}</p>
              </div>
            )) }
          </div>
        </div>
        <div className='w-full flex flex-col' id='todo-list'>
          <div className='w-full border-b	border-black border-solid' id='todo-list-header'>
            <h3>To Do</h3>
          </div>
          <div className='w-full flex flex-col py-4 px-2' id='todo-list-table'>
            { data?.todo?.map((task, i) => (
              <div className='w-full flex flex-row items-start mb-2' key={`todo-list-row-${task.id}`} >
                <input type='checkbox' onChange={async (e) => {
                  
                  console.log(`toggled checkbox ${task.id} - ${e.target.checked}`)
                  await patchTaskHandler(task, e.target.checked, i)

                }} defaultChecked={task.done} value={task.id} className='mt-0.5 mr-2 rounded' />
                <p className='text-sm'>{task.label}</p>
              </div>
            )) }
          </div>
        </div>

      </div>

    </main>
  );
}
