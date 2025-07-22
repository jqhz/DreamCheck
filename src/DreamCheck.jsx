import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, setDoc as setDocGlobal } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './DreamCheck.css'; // Ensure you have a CSS file for styles

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getAccountCreationDate(user) {
  if (user && user.metadata && user.metadata.creationTime) {
    return formatDate(new Date(user.metadata.creationTime));
  }
  return formatDate(new Date());
}

export default function DreamCheck() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [checklist, setChecklist] = useState([]);
  const [dream, setDream] = useState('');
  const [actionHistory, setActionHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [routine, setRoutine] = useState([]); // persistent routine
  const [routineEditMode, setRoutineEditMode] = useState(false);
  const [routineInput, setRoutineInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const user = auth.currentUser;
  const latestDate = useRef(selectedDate);
  const creationDate = getAccountCreationDate(user);
  const today = formatDate(new Date());

  // Load per-day checklist and dream
  useEffect(() => {
    if (!user) return;
    latestDate.current = selectedDate;
    const ref = doc(db, 'users', user.uid, 'entries', selectedDate);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setChecklist(data.checklist || []);
        setDream(data.dream || '');
      } else {
        setChecklist([]);
        setDream('');
      }
    });
  }, [selectedDate, user]);

  // Load persistent routine
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'routine', 'global');
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setRoutine(snap.data().routine || []);
      } else {
        setRoutine([]);
      }
    });
  }, [user]);

  // Save checklist and dream (per day)
  const handleSave = () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'entries', selectedDate);
    setDoc(ref, { checklist, dream }).then(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    });
    // Also save routine in case it was changed
    const routineRef = doc(db, 'users', user.uid, 'routine', 'global');
    setDocGlobal(routineRef, { routine });
  };

  // Save routine (persistent)
  const saveRoutine = (newRoutine) => {
    if (!user) return;
    setRoutine(newRoutine);
    const ref = doc(db, 'users', user.uid, 'routine', 'global');
    setDocGlobal(ref, { routine: newRoutine }).then(() => {
      console.log('Routine saved to Firestore:', newRoutine);
    });
  };

  // Checklist handlers
  const handleCheck = (idx) => {
    setChecklist((prev) => prev.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item
    ));
  };
  const handleAdd = () => {
    if (!inputValue.trim()) return;
    setActionHistory((prev) => [...prev, { type: 'delete', index: checklist.length, item: { text: inputValue, checked: false } }]);
    setChecklist((prev) => [...prev, { text: inputValue, checked: false }]);
    setInputValue('');
  };
  const handleRemove = (idx) => {
    setActionHistory((prev) => [...prev, { type: 'add', index: idx, item: checklist[idx] }]);
    setChecklist((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleUndo = () => {
    setActionHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      if (last.type === 'add') {
        setChecklist((prevList) => {
          // Only add back if not already present at that index
          if (prevList[last.index] && prevList[last.index].text === last.item.text) {
            return prevList;
          }
          return [
            ...prevList.slice(0, last.index),
            last.item,
            ...prevList.slice(last.index)
          ];
        });
      } else if (last.type === 'delete') {
        setChecklist((prevList) => prevList.slice(0, -1));
      }
      return prev.slice(0, -1);
    });
  };

  // Routine handlers
  const handleRoutineAdd = () => {
    if (!routineInput.trim()) return;
    const newRoutine = [...routine, { text: routineInput, checked: false }];
    saveRoutine(newRoutine);
    setRoutineInput('');
  };
  const handleRoutineRemove = (idx) => {
    const newRoutine = routine.filter((_, i) => i !== idx);
    saveRoutine(newRoutine);
  };
  const handleRoutineCheck = (idx) => {
    const newRoutine = routine.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item
    );
    saveRoutine(newRoutine);
  };
  const handleRoutineReset = () => {
    const newRoutine = routine.map(item => ({ ...item, checked: false }));
    saveRoutine(newRoutine);
  };
  const handleRoutineEditToggle = () => {
    // When exiting edit mode (Done), always save the current routine
    if (routineEditMode) {
      saveRoutine(routine);
    }
    setRoutineEditMode(!routineEditMode);
  };

  // Navigation
  const handlePrevDay = () => {
    if (selectedDate <= creationDate) return;
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    const prevDate = formatDate(prev);
    if (prevDate < creationDate) return;
    setSelectedDate(prevDate);
  };
  const handleNextDay = () => {
    if (selectedDate >= today) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    const nextDate = formatDate(next);
    if (nextDate > today) return;
    setSelectedDate(nextDate);
  };

  // Log out
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-slate-300 p-4 md:p-8">
      {/* Navbar */}
      <nav className="relative z-20 w-full flex items-center justify-between px-8 py-4 bg-blue-100 bg-opacity-90 backdrop-blur border-b border-gray-300 mb-8 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-2xl mr-2">🌙</span>
          <span className="text-2xl font-extrabold text-indigo-700 tracking-tight select-none">DreamCheck</span>
        </div>
        <div className="flex items-center gap-3">
          {user && user.photoURL && (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-gray-300" />
          )}
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-500 font-semibold py-2 px-5 rounded-lg transition duration-200 text-base"
          >
            Log Out
          </button>
        </div>
      </nav>
      {/* Main Card */}
      <div className="grid grid-rows-[auto_1fr_auto] place-items-center flex-1">
      <div className="bg-rose-100 bg-opacity-95 rounded-2xl shadow-xl p-8 w-full max-w-4xl min-h-[600px] flex flex-col justify-between gap-10 border border-gray-200 mx-2 md:mx-8 h-full">

        {/* Save Success Indicator */}
        {saveSuccess && (
          <div className="flex items-center justify-center mb-4">
            <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded shadow">✔ Saved!</span>
          </div>
        )}

        {/* Top row: Navigation */}
        <div className="grid grid-cols-[auto_auto_auto] gap-8 items-center justify-center mb-8">
          <button
            onClick={handlePrevDay}
            disabled={selectedDate <= creationDate}
            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-lg text-gray-900 shadow"
            max={today}
            min={creationDate}
          />
          <button
            onClick={handleNextDay}
            disabled={selectedDate >= today}
            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Main content area */}
        <div className="w-full h-full grid grid-cols-2 gap-x-12 gap-y-0 mb-8 flex-1">
          {/* Checklist */}
          <div className="flex flex-col bg-blue-50 rounded-xl p-6 shadow-inner border border-gray-300 gap-6">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">Checklist</h3>
            <ul className="flex-1 overflow-y-auto mb-4 flex flex-col gap-3 px-2 list-none p-0">
              {checklist.map((item, idx) => (
                <li
                  key={idx}
                  className={`w-full flex items-center justify-between p-0 px-4 py-3 rounded-lg transition-all duration-200 border border-gray-300 gap-3 cursor-pointer select-none
                    ${item.checked ? 'bg-green-300 text-gray-800 line-through' : 'bg-gray-200 text-gray-900'}`}
                  onClick={() => handleCheck(idx)}
                >
                  <span className="flex-1">
                    {item.text || <span className="italic text-gray-400">(Empty)</span>}
                  </span>
                  <button
                    className="ml-4 text-xs text-red-500 hover:underline"
                    onClick={e => { e.stopPropagation(); handleRemove(idx); }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-2">
              <input
                type="text"
                placeholder="Add checklist item..."
                className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>

          {/* Right side: Routine + Dream Journal */}
          <div className="w-full grid grid-rows-[auto_1fr] gap-y-8">
            {/* Routine */}
            <div className="bg-yellow-50 rounded-xl p-6 shadow-inner border border-yellow-300 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-yellow-700">Routine</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleRoutineReset}
                    disabled={routine.length === 0}
                    className="text-sm px-3 py-1 rounded bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleRoutineEditToggle}
                    className={`text-sm px-3 py-1 rounded ${routineEditMode ? 'bg-yellow-600 text-white' : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'}`}
                  >
                    {routineEditMode ? 'Done' : 'Edit'}
                  </button>
                </div>
              </div>
              <ul className="overflow-y-auto mb-2 flex flex-col gap-2">
                {routine.map((item, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border border-yellow-200 gap-3 cursor-pointer select-none
                      ${item.checked ? 'bg-green-200 text-gray-800 line-through' : 'bg-white text-gray-900'}`}
                    onClick={() => !routineEditMode && handleRoutineCheck(idx)}
                  >
                    <span className="flex-1">{item.text}</span>
                    {routineEditMode && (
                      <button
                        className="ml-4 text-xs text-red-500 hover:underline"
                        onClick={e => { e.stopPropagation(); handleRoutineRemove(idx); }}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {routineEditMode && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add routine item..."
                    className="border border-gray-300 rounded px-3 py-2 flex-1"
                    value={routineInput}
                    onChange={e => setRoutineInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRoutineAdd(); }}
                  />
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    onClick={handleRoutineAdd}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Dream Journal */}
            <div className="bg-indigo-50 rounded-xl p-6 shadow-inner border border-indigo-200 flex flex-col">
              <h3 className="text-xl font-bold text-indigo-700 mb-2">Dream Journal</h3>
              <textarea
                className="flex-1 border border-gray-300 rounded px-3 py-2 resize-none min-h-[100px] text-gray-800"
                value={dream}
                onChange={e => setDream(e.target.value)}
                placeholder="Write your dream here..."
              />
            </div>
          </div>
        </div>

        {/* Bottom row: Actions */}
        <div className="grid grid-cols-4 gap-6 items-center justify-center">
          <button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold">Add Item</button>
          <button onClick={handleUndo} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-5 py-2 rounded-lg font-semibold">Undo</button>
          <button onClick={() => setRoutineEditMode(!routineEditMode)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-5 py-2 rounded-lg font-semibold">Edit</button>
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">Save</button>
        </div>
      </div>
    </div>
  </div>
  );
} 