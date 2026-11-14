import { useEffect, useState } from 'react'
import logo from './assets/LogoTagaDetect.png'
import detectorIcon from './assets/DetectorIcon.png'
import historyIcon from './assets/HistoryIcon.png'
import notesIcon from './assets/NotesIcon.png'

const cardClass =
  'bg-card border border-line rounded-[18px] p-[30px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-colors duration-300'
const cardTitleClass = 'text-[1.3rem] mb-5 font-semibold text-main'
const metricCardClass =
  'bg-card-inner border border-line rounded-xl p-5 transition-colors duration-300'
const metricLabelClass =
  'block text-muted text-[0.9rem] mb-2 uppercase tracking-[0.5px]'
const subInfoClass = 'text-muted text-[0.85rem] mt-1.5'

const heatClasses = {
  low: 'bg-[rgba(76,175,80,0.2)] border-[#4caf50]',
  mid: 'bg-[rgba(255,152,0,0.2)] border-[#ff9800]',
  high: 'bg-[rgba(244,67,54,0.2)] border-[#f44336]',
}

const pageTitles = {
  detector: 'Detector',
  history: 'History',
  notes: 'Notes',
  note: 'Notes',
}

const sampleNotes = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: n,
  title: `Sample Note ${n}`,
  body: 'This is a sample note. Click it to edit the text.',
}))

function loadNotes() {
  try {
    const saved = localStorage.getItem('notes')
    if (saved) return JSON.parse(saved)
  } catch {
    // If saved notes cannot be read, start with the samples
  }
  return sampleNotes
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('detector')
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [sentences, setSentences] = useState([])
  const [history, setHistory] = useState([])
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  )
  const [notes, setNotes] = useState(loadNotes)
  const [notesOpen, setNotesOpen] = useState(false)
  const [activeNoteId, setActiveNoteId] = useState(null)

  const isLight = theme === 'light'
  const activeNote = notes.find((n) => n.id === activeNoteId)

  // Apply the theme to the page and remember it
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Save the notes every time they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }

  function switchTab(tabName, event) {
    if (event) event.preventDefault()
    setActiveTab(tabName)
    closeSidebarOnMobile()
  }

  function openNote(id, event) {
    if (event) event.preventDefault()
    setActiveNoteId(id)
    setActiveTab('note')
    closeSidebarOnMobile()
  }

  function addNote() {
    const newNote = { id: Date.now(), title: 'Untitled note', body: '' }
    setNotes((prev) => [newNote, ...prev])
    openNote(newNote.id)
  }

  function updateNote(id, field, value) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    )
  }

  function deleteNote(id) {
    if (!window.confirm('Delete this note?')) return
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setActiveTab('notes')
  }

  function analyzeText() {
    const trimmed = text.trim()
    if (!trimmed) {
      alert('Please enter or upload some text to analyze.')
      return
    }

    const score = Math.floor(Math.random() * 75) + 15
    let risk = 'Low Risk'
    let color = '#4caf50'

    if (score > 70) {
      risk = 'High AI Risk'
      color = '#f44336'
    } else if (score > 40) {
      risk = 'Moderate Risk'
      color = '#ff9800'
    }

    setResult({ score, risk, color })

    const found = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]
    setSentences(
      found.map((sentence) => {
        const sentScore = Math.random()
        let level = 'low'
        if (sentScore > 0.7) level = 'high'
        else if (sentScore > 0.4) level = 'mid'
        return { text: sentence.trim(), level }
      })
    )

    setHistory((prev) => [
      {
        text: trimmed.substring(0, 60) + (trimmed.length > 60 ? '...' : ''),
        score,
        risk,
        date: new Date().toLocaleTimeString(),
      },
      ...prev,
    ])
  }

  function handleFileUpload(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setText(e.target.result)
      reader.readAsText(file)
    }
  }

  const navLinkClass = (name) =>
    `flex items-center gap-3 px-[18px] py-3.5 rounded-[10px] text-[1.1rem] no-underline transition-all duration-200 hover:bg-accent hover:text-white ${
      activeTab === name ? 'bg-accent text-white' : 'text-muted'
    }`

  const notesRowActive = activeTab === 'notes' || activeTab === 'note'

  const gaugeBackground = result
    ? `conic-gradient(${result.color} ${result.score * 3.6}deg, var(--color-gauge-track) 0deg)`
    : 'conic-gradient(var(--color-accent) 0deg, var(--color-gauge-track) 0deg)'

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Sidebar */}
      <header
        className={`fixed top-0 left-0 w-[260px] h-screen bg-bg-dark px-5 py-[30px] transition-all duration-300 z-[1000] border-r border-line shadow-[4px_0_15px_rgba(0,0,0,0.15)] ${
          sidebarOpen ? '' : '-translate-x-full'
        }`}
      >
        <div className="text-center mb-[30px] mt-5">
          <img src={logo} alt="Logo" className="max-w-full h-auto object-contain" />
        </div>
        <nav>
          <ul className="list-none">
            <li className="mb-3">
              <a
                href="#"
                className={navLinkClass('detector')}
                onClick={(e) => switchTab('detector', e)}
              >
                <img
                  src={detectorIcon}
                  alt="Detector Icon"
                  className="w-[30px] h-[30px] object-contain"
                />
                <span>AI-Detector</span>
              </a>
            </li>
            <li className="mb-3">
              <a
                href="#"
                className={navLinkClass('history')}
                onClick={(e) => switchTab('history', e)}
              >
                <img
                  src={historyIcon}
                  alt="History Icon"
                  className="w-[30px] h-[30px] object-contain"
                />
                <span>History</span>
              </a>
            </li>

            {/* Notes row: icon and text open the grid, the arrow opens the list */}
            <li className="mb-3">
              <div
                className={`flex items-center rounded-[10px] transition-all duration-200 hover:bg-accent hover:text-white ${
                  notesRowActive ? 'bg-accent text-white' : 'text-muted'
                }`}
              >
                <a
                  href="#"
                  className="flex flex-1 items-center gap-3 px-[18px] py-3.5 text-[1.1rem] no-underline text-inherit"
                  onClick={(e) => switchTab('notes', e)}
                >
                  <img
                    src={notesIcon}
                    alt="Notes Icon"
                    className="w-[30px] h-[30px] object-contain"
                  />
                  <span>Notes</span>
                </a>
                <button
                  type="button"
                  aria-label="Show or hide the list of notes"
                  aria-expanded={notesOpen}
                  className="px-4 py-3.5 text-[1.1rem] text-inherit bg-transparent border-none cursor-pointer"
                  onClick={() => setNotesOpen(!notesOpen)}
                >
                  <span
                    className={`inline-block transition-transform duration-200 ${
                      notesOpen ? 'rotate-90' : ''
                    }`}
                  >
                    &gt;
                  </span>
                </button>
              </div>

              {notesOpen && (
                <ul className="list-none mt-1 ml-3 max-h-[260px] overflow-y-auto">
                  {notes.length === 0 ? (
                    <li className="px-[18px] py-2 text-muted text-[0.95rem]">
                      No notes yet
                    </li>
                  ) : (
                    notes.map((note) => (
                      <li key={note.id}>
                        <a
                          href="#"
                          onClick={(e) => openNote(note.id, e)}
                          className={`block truncate px-[18px] py-2 rounded-lg text-base no-underline transition-all duration-200 hover:bg-accent hover:text-white ${
                            activeTab === 'note' && activeNoteId === note.id
                              ? 'bg-accent text-white'
                              : 'text-muted'
                          }`}
                        >
                          {note.title || 'Untitled note'}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* Sidebar Toggle Button (top left) */}
      <button
        className={`fixed top-5 z-[1001] w-12 h-12 text-[1.3rem] rounded-[10px] bg-card text-accent border border-line cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 hover:bg-accent hover:text-white ${
          sidebarOpen ? 'left-[280px]' : 'left-5'
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Theme Switch (top right) */}
      <div className="fixed top-5 right-5 z-[1001]">
        <label
          className="relative inline-block w-[60px] h-[30px]"
          aria-label="Toggle Dark/Light Mode"
        >
          <input
            type="checkbox"
            className="absolute w-0 h-0 opacity-0"
            checked={isLight}
            onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
          />
          <span className="absolute inset-0 cursor-pointer rounded-[30px] border border-line bg-slider shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all duration-[400ms]">
            <span
              className={`absolute bottom-1 left-1 h-5 w-5 rounded-full bg-white z-[2] transition-all duration-[400ms] ${
                isLight ? 'translate-x-[29px]' : ''
              }`}
            />
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-sm transition-all duration-[400ms] ${
                isLight ? 'left-2' : 'left-8'
              }`}
            >
              {isLight ? '☀️' : '🌙'}
            </span>
          </span>
        </label>
      </div>

      {/* Main Content */}
      <main
        className={`w-full max-w-[1350px] grow px-[30px] py-10 transition-[margin] duration-300 ${
          sidebarOpen ? 'ml-[290px] mr-auto' : 'mx-auto'
        }`}
      >
        {/* Page title */}
        <div className="flex justify-center items-center mb-[35px] border-b border-line pb-[15px]">
          <span className="text-[1.4rem] text-main font-semibold pb-0.5">
            {pageTitles[activeTab]}
          </span>
        </div>

        {/* DETECTOR VIEW */}
        {activeTab === 'detector' && (
          <section className="flex flex-col gap-[30px]">
            {/* Content Analysis */}
            <div className={cardClass}>
              <h3 className={cardTitleClass}>Content Analysis</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your English, Tagalog, or Taglish text here or upload a file."
                className="w-full h-[340px] bg-card-inner border border-line rounded-xl p-5 text-main text-[1.05rem] leading-[1.6] resize-y outline-none mb-5 transition-colors duration-300 focus:border-accent"
              />
              <div className="flex gap-4">
                <label
                  htmlFor="fileUpload"
                  className="flex-1 p-4 rounded-[10px] font-semibold text-[1.05rem] text-center cursor-pointer bg-card-inner text-main border border-line transition-all duration-200 hover:bg-line"
                >
                  UPLOAD FILE (.TXT)
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  className="flex-1 p-4 rounded-[10px] font-semibold text-[1.05rem] text-center cursor-pointer border-none bg-accent text-white transition-all duration-200 hover:bg-accent-hover"
                  onClick={analyzeText}
                >
                  Detect AI Content
                </button>
              </div>
            </div>

            {/* Result Analysis */}
            <div className={cardClass}>
              <h3 className={cardTitleClass}>Result Analysis</h3>
              <div className="flex items-center gap-10 max-md:flex-col max-md:text-center">
                <div className="flex flex-col items-center min-w-[200px]">
                  <div
                    className="relative w-[170px] h-[170px] rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.15)] mb-4 transition-[background] duration-[400ms] before:content-[''] before:absolute before:w-[135px] before:h-[135px] before:rounded-full before:bg-card before:transition-colors before:duration-300"
                    style={{ background: gaugeBackground }}
                  >
                    <span className="relative text-[2.3rem] font-bold">
                      {result ? `${result.score}%` : '0%'}
                    </span>
                  </div>
                  <div
                    className="bg-card-inner border border-line px-[22px] py-2 rounded-[30px] text-base font-semibold"
                    style={
                      result
                        ? { backgroundColor: result.color, color: '#ffffff' }
                        : undefined
                    }
                  >
                    {result ? result.risk : 'Risk Level'}
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 grow w-full">
                  <div className={metricCardClass}>
                    <label className={metricLabelClass}>AI Score</label>
                    <div className="text-2xl font-bold text-main">
                      {result ? `${result.score}% AI` : '0%'}
                    </div>
                    <div className={subInfoClass}>Overall probability score</div>
                  </div>
                  <div className={metricCardClass}>
                    <label className={metricLabelClass}>Classification</label>
                    <div className="text-2xl font-bold text-main">
                      {result ? result.risk : 'Ready'}
                    </div>
                    <div className={subInfoClass}>Predicted text source</div>
                  </div>
                  <div className={metricCardClass}>
                    <label className={metricLabelClass}>Analysis Mode</label>
                    <div className="text-2xl font-bold text-accent">Sentence Heatmap</div>
                    <div className={subInfoClass}>Detailed breakdown active below</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentence Heatmap */}
            <div className={cardClass}>
              <h3 className={cardTitleClass}>Sentence-Level Heatmap</h3>
              <div className="bg-card-inner border border-line rounded-xl p-[25px] min-h-[180px] text-[1.05rem] leading-[1.8] transition-colors duration-300">
                {sentences.length === 0 ? (
                  <span className="text-muted">
                    Run detection to see sentence breakdown...
                  </span>
                ) : (
                  sentences.map((s, i) => (
                    <span
                      key={i}
                      className={`inline-block px-2 py-1 rounded-md mr-1.5 mb-2 border-b-2 ${heatClasses[s.level]}`}
                    >
                      {s.text}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* HISTORY VIEW */}
        {activeTab === 'history' && (
          <section>
            <div className={cardClass}>
              <h3 className={cardTitleClass}>Analysis History</h3>
              <div className="flex flex-col gap-4">
                {history.length === 0 ? (
                  <p className="text-muted">No previous scans found.</p>
                ) : (
                  history.map((item, i) => (
                    <div
                      key={i}
                      className="bg-card-inner border border-line p-5 rounded-xl flex justify-between items-center transition-colors duration-300"
                    >
                      <div>
                        <strong>"{item.text}"</strong>
                        <small className="text-muted block mt-1.5">
                          Scanned at {item.date}
                        </small>
                      </div>
                      <div className="text-right">
                        <span className="text-[1.4rem] font-bold">{item.score}%</span>
                        <span className="text-[0.85rem] block text-accent font-semibold">
                          {item.risk}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* NOTES GRID VIEW */}
        {activeTab === 'notes' && (
          <section>
            <div className="flex justify-end mb-5">
              <button
                className="px-5 py-3 rounded-[10px] font-semibold cursor-pointer border-none bg-accent text-white transition-all duration-200 hover:bg-accent-hover"
                onClick={addNote}
              >
                + New note
              </button>
            </div>

            {notes.length === 0 ? (
              <p className="text-muted">
                No notes yet. Click New note to create one.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => openNote(note.id)}
                    className="min-h-[140px] p-4 rounded-2xl bg-[#6b6880] text-white cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:-translate-y-1"
                  >
                    <h4 className="font-semibold mb-2 truncate">
                      {note.title || 'Untitled note'}
                    </h4>
                    <p className="text-[0.95rem] whitespace-pre-wrap break-words line-clamp-6">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SINGLE NOTE VIEW */}
        {activeTab === 'note' && activeNote && (
          <section>
            <button
              className="mb-5 text-accent font-semibold bg-transparent border-none cursor-pointer text-base hover:text-accent-hover"
              onClick={() => setActiveTab('notes')}
            >
              ← Back to notes
            </button>
            <div className={cardClass}>
              <input
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, 'title', e.target.value)}
                placeholder="Note title"
                className="w-full bg-card-inner border border-line rounded-xl p-4 mb-4 text-main text-[1.2rem] font-semibold outline-none transition-colors duration-300 focus:border-accent"
              />
              <textarea
                value={activeNote.body}
                onChange={(e) => updateNote(activeNote.id, 'body', e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-[340px] bg-card-inner border border-line rounded-xl p-5 text-main text-[1.05rem] leading-[1.6] resize-y outline-none transition-colors duration-300 focus:border-accent"
              />
              <div className="flex justify-end mt-5">
                <button
                  className="px-5 py-3 rounded-[10px] font-semibold cursor-pointer border-none bg-[#f44336] text-white transition-all duration-200 hover:opacity-90"
                  onClick={() => deleteNote(activeNote.id)}
                >
                  Delete note
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App