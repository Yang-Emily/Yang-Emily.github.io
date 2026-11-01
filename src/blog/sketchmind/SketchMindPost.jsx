import { useEffect, useState } from 'react'
import { AppWindow, Copy } from 'lucide-react'
import Strokes from './Strokes'
import RealSystem from './RealSystem'
import PaperChallenges from './PaperChallenges'
import Merge from './Merge'
import Views from './Views'
import DoneCheck from './DoneCheck'
import AbstractPen from './AbstractPen'
import { PaperNotebook, LearnerThemes, InstructorScenes } from './Study'
import ThreeWays from './ThreeWays'
import { TOOL } from './ui'
import './sketchmind.css'

const PAPER = `${import.meta.env.BASE_URL}uist26_sketchmind.pdf`
const TALK = 'https://yang-emily.github.io/interactive-talk/sketchmind/'
const TOOL_URL = 'https://sketchmind.peachhub-cntr1.inf.ethz.ch'

const BIBTEX = String.raw`@inproceedings{10.1145/3830398.3830500,
  author = {Wu, Yang and Pit-Claudel, Cl{\'e}ment and Wang, April Yi},
  title = {SketchMind: Toward Executable Pen-Based Sketching for Constructing Sorting Algorithms},
  year = {2026},
  isbn = {9798400728563},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/3830398.3830500},
  doi = {10.1145/3830398.3830500},
  abstract = {Pen-and-paper tracing is commonly used to think through algorithms before writing code, allowing learners to step through concrete executions and explore possible solutions. However, this process does not readily support abstraction. As traces grow, they lose structure. Steps accumulate into long sequences and are often skipped or compressed, leading to incomplete or inconsistent reasoning. As a result, learners struggle to extract reusable algorithmic patterns or generalize beyond individual instances. We present SketchMind , a proof-of-concept sketch-based programming system in which users construct executable traces of sorting algorithms through pen-based interactions. By performing operations directly on visual representations (e.g., arrays and variables) using pen strokes, users can construct and refine sorting algorithms without writing code. SketchMind supports four key capabilities: (1) executable tracing, where actions are recorded and replayed as runnable steps; (2) reusable pens, which encapsulate trace segments into user-defined procedures; (3) multi-level trace views across values, indices, and symbolic parameters; and (4) cross-instance validation, which applies learned procedures to new inputs and generates minimal counterexamples.},
  booktitle = {Proceedings of the 39th Annual ACM Symposium on User Interface Software and Technology},
  articleno = {219},
  numpages = {13},
  keywords = {Algorithmic reasoning, Sketch-based interaction, Executable tracing, Programming by demonstration;},
  location = {Detroit, Michigan, USA},
  series = {UIST '26}
}`

const CITATION = `Yang Wu, Clément Pit-Claudel, and April Yi Wang. 2026.
SketchMind: Toward Executable Pen-Based Sketching for Constructing Sorting Algorithms.
In Proceedings of the 39th Annual ACM Symposium on
User Interface Software and Technology (UIST '26).
Association for Computing Machinery, New York, NY, USA, Article 219, 1–13.`

const Pen = ({ color, children }) => <span className="sk-pen" style={{ color }}>{children}</span>

export default function SketchMindPost() {
  const [copyStatus, setCopyStatus] = useState('')
  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX)
      setCopyStatus('Copied!')
    } catch {
      setCopyStatus('Copy failed. Please try again.')
    }
  }
  const [systemOpen, setSystemOpen] = useState(false)
  const [readingView, setReadingView] = useState('value')
  const [counterexampleNote, setCounterexampleNote] = useState('')
  const [paperNote, setPaperNote] = useState(null)
  useEffect(() => {
    const previous = document.title
    document.title = 'SketchMind · Yang Wu'
    return () => { document.title = previous }
  }, [])

  return (
    <article className="sk-post">
      <header>
        <div className="sk-title-row">
          <h1>SketchMind</h1>
          <p className="sk-deck">Toward executable pen-based sketching for constructing sorting algorithms</p>
        </div>
        <p className="sk-byline">
          <a href="#/">Yang Wu</a>,{' '}
          <a href="https://pit-claudel.fr/clement/" target="_blank" rel="noopener noreferrer">Clément Pit-Claudel</a>,{' '}
          <a href="https://aprilwang.me/" target="_blank" rel="noopener noreferrer">April Yi Wang</a> · UIST 2026
        </p>
        <nav className="sk-links" aria-label="Paper links">
          <a href={PAPER} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 3 10 .5 4 4-.5 13-14 .5L5 3Zm10 .5-.5 5L19 8M8 11l7 .3M8 15l7-.2" /></svg>
            Paper
          </a>
          <a href={TALK} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 4 18 .4-.5 13-8-.2-5 4 .6-4-5-.3L3 4Z" /><path d="m10 8 .2 6 5-3-5.2-3Z" /></svg>
            Talk
          </a>
          <a href={TOOL_URL} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 19 2-6L16 3l4 4L10 17l-6 2Zm2-6 4 4M14 5l4 4M4 21q7-2 16-.5" /></svg>
            Try it ↗
          </a>
        </nav>
      </header>

      <section className="sk-challenges-intro" aria-label="Challenges of tracing on paper">
        <p>
          Write down 5, 2, 3, 4, 1 and work through bubble sort with a pen.
          Compare 5 with 2, exchange them, and write out the new row. Now compare 5 with 3.
          Before long, most of the marks on the page are copies of marks you have already made.
        </p>
        <p>
          The drawing below shows where this gets awkward. Select a label to look at the
          repeated copying, the repeated operations, or what happens when the input changes.
        </p>
        <PaperChallenges />
      </section>

      <div className="sk-essay-section sk-system-intro">
        <div className="sk-main">
          <p>
            SketchMind lets you carry out those operations on the drawing itself.
            You write an array, choose a pen, and draw across the elements you want to use.
            The system executes the operation and records a step. You can then combine those
            steps into a procedure and try it on another input.
          </p>
        </div>
        <aside className="sk-margin">
          <button type="button" className="sk-inline-link" aria-expanded={systemOpen} aria-controls="sk-real-system" onClick={() => setSystemOpen(open => !open)}><AppWindow size={15} aria-hidden="true" /> Try the full system here.</button>
        </aside>
        {systemOpen && <div id="sk-real-system" className="sk-system-entry sk-system-wide"><RealSystem /></div>}
      </div>

      <section className="sk-essay-section" aria-label="Strokes that run" id="strokes">
        <div className="sk-main">
          <h2>Strokes that run</h2>
          <p>
            In SketchMind, you first write an array with the Data pen and scan the handwriting.
            Here, we use [3, 1, 7, 4] as an example.
          </p>
          <p>
            Consider the first pair in the example below. With the <Pen color={TOOL.compare}>compare</Pen> pen
            selected, draw from 3 to 1. The operation is <code>is_bigger(3,1)</code>, which returns True.
            The numbers stay where they are. Select <Pen color={TOOL.swap}>swap</Pen> and draw across
            the same pair: now they exchange places.
          </p>
          <p>
            Try comparing the next pair. The array has changed, so you are now comparing 3 with 7.
            Each operation adds a step on the right. Select a step to inspect its result,
            or use the play button to run through the sequence again.
          </p>
        </div>
        <div className="sk-main sk-strokes-demo"><div className="sk-demo"><Strokes /></div></div>
        <aside className="sk-margin sk-strokes-note">
          <p>
            Strokes are shape-independent: you can draw any shape, as long as the stroke
            crosses the numbers you want to operate on. The selected pen determines the operation.
          </p>
        </aside>
      </section>

      <section className="sk-essay-section" aria-label="Pens made from your own steps" id="pens">
        <div className="sk-main">
          <h2>Pens made from your own steps</h2>
          <p>
            Comparing a pair and swapping it are separate operations. Usually, though, you want
            a particular relationship between them: swap only if the left value is larger.
            Drag the swap card onto the comparison below. The swap becomes the True branch;
            the False branch does nothing. Then draw across two numbers on the left to try your new pen.
          </p>
          <div className="sk-demo"><Merge /></div>
          <p>
            The result is <code>compare_and_swap</code>, with its own pen in the palette.
            A stroke with this pen applies the conditional to another pair. The expanded
            card shows the comparison and its two branches; the steps you combined remain inspectable.
          </p>
          <p>
            The same idea extends to repetition. A sequence of compare-and-swap operations
            along adjacent pairs can form a <code>bubble_up</code> pen: one pass that moves
            the largest value to the end of a range. Repeating that pass over successively
            shorter ranges gives the outer loop of bubble sort.
          </p>
        </div>
      </section>

      <section className="sk-essay-section sk-views-section" aria-label="Reading the same steps">
        <div className="sk-main">
          <h2>Reading a trace at different levels</h2>
          <p>
            SketchMind supports the transition from concrete examples to generalized procedures
            through three coordinated trace views: values, indices, and symbolic parameters.
            Learners can inspect execution outcomes, identify the positions involved, and express
            the same operation across different array segments. This progression helps them
            identify recurring patterns and generalize them into reusable algorithmic structures.
          </p>
        </div>
        <div className="sk-main sk-views-demo"><div className="sk-demo"><Views onViewChange={setReadingView} /></div></div>
        <aside className="sk-margin sk-views-note" aria-live="polite">
          {readingView === 'value' && <p>
            <strong>Value view.</strong> The calls use the values at each step:
            {' '}<code>compare_and_swap(3,1)</code>, <code>compare_and_swap(3,7)</code>,
            and <code>compare_and_swap(7,4)</code>. You can follow what happens to the numbers,
            but the repeating pattern is harder to see.
          </p>}
          {readingView === 'index' && <p>
            <strong>Index view.</strong> The calls identify array positions: 0 and 1,
            then 1 and 2, then 2 and 3. The values change as swaps run, while the sequence
            of adjacent positions makes the pattern easier to see.
          </p>}
          {readingView === 'param' && <p>
            <strong>Parameter view.</strong> Each call has the form
            {' '}<code>compare_and_swap(a[i],a[i+1])</code>. What changes is <code>i</code>.
            This shows the shared operation; constructing a loop is still a separate step.
          </p>}
        </aside>
      </section>

      <section className="sk-essay-section" aria-label="Checking a plan on another input" id="counterexamples">
        <div className="sk-main">
          <h2>When a sorted array is not enough</h2>
          <p>
            A single left-to-right pass turns [3, 1, 7, 4] into [1, 3, 4, 7].
            Every value is in order. Does that mean the plan is finished?
            Keep the same operations and change the last input value from 4 to 2.
            The result is [1, 3, 2, 7]. The first example happened to need only one pass.
          </p>
          <p>
            SketchMind looks for this kind of failure when the learner selects <b>Done</b>.
            It keeps the constructed procedure and searches for a nearby input on which
            replay leaves the array unsorted. It then adds that input as another instance
            for the learner to inspect and revise the plan against.
          </p>
          <p>
            Select Done below to try it. You can also drag the input digits up or down
            before checking the plan.
          </p>
          <div className="sk-demo"><DoneCheck /></div>
        </div>
        <aside className="sk-margin">
          <p>
            The full system compares the learner’s trace with a reference trace and uses Z3
            to search for a failing input. Its numerical distance is the sum of absolute
            changes to the input values. The solver supplies a counterexample, not a repair.
          </p>
          <p>
            This widget uses exhaustive search over distinct digits from 1 to 9.
            The result only covers those inputs. It does not establish correctness for all arrays.
          </p>
        </aside>
      </section>

      <section className="sk-essay-section" aria-label="What people did with it" id="study">
        <div className="sk-main">
          <h2>What people did with it</h2>
          <p>
            We tried SketchMind with 15 learners and 5 instructors. All 20 knew bubble sort;
            none knew pancake sort. In an in-person session on an iPad with an Apple Pencil,
            participants first sketched each algorithm on paper, then worked with it in SketchMind.
            Sessions were scheduled for an hour, including guided tasks, questionnaires, and an interview.
          </p>
          <p id="study-paper">
            <strong className="sk-run-in">On paper.</strong>{' '}
            The sketches give a more specific account of the problems above. One participant
            marked 8 &lt; 5. Others omitted later iterations, invented marks for a flip,
            or wrote rows of values without specifying the loop.
          </p>
          <div className="sk-demo"><PaperNotebook onNoteChange={setPaperNote} /></div>
        </div>
        <aside className="sk-margin">
          {paperNote && <div aria-live="polite"><p>{paperNote.text}</p><cite>{paperNote.who}</cite></div>}
          <p>
            The five categories describe observations from the paper sketches. They are not
            counts of errors made by every participant. Some drawings also used deliberate
            shorthand or an abstract representation rather than attempting a full value trace.
          </p>
        </aside>
      </section>

      <LearnerThemes />

      <section className="sk-instructors" aria-label="Instructor perspectives" id="study-instructors">
        <div className="sk-main">
        <div className="sk-copy">
          <p>
            <strong className="sk-run-in">Where instructors would use it.</strong>{' '}
            Drawing on their own teaching contexts, instructors suggested several ways to
            use SketchMind: for shared demonstrations in class, practice after a lecture,
            and independent homework.
          </p>
        </div>
        <div className="sk-demo"><InstructorScenes /></div>
        </div>
      </section>

      <section className="sk-essay-section" aria-label="Open questions" id="next">
        <div className="sk-main">
          <h2>Open questions</h2>
          <p>
            <strong className="sk-run-in">Which counterexample is clearest?</strong>{' '}
            Changing a value is only one way to make a nearby input. You could keep the
            values and rearrange them, or leave them in place and add another number.
            The three examples below all defeat the same one-pass plan, but they ask
            the learner to notice different changes.
          </p>
        </div>
        <div className="sk-main sk-counterexample-demo"><div className="sk-demo"><ThreeWays onNoteChange={setCounterexampleNote} /></div></div>
        <aside className="sk-margin sk-counterexample-note" aria-live="polite">
          {counterexampleNote && <p>{counterexampleNote}</p>}
        </aside>
      </section>

      <section className="sk-essay-section" aria-label="Beyond sorting" id="dijkstra">
        <div className="sk-main">
          <p>
            <strong className="sk-run-in">Beyond sorting.</strong>{' '}
            We extended SketchMind from bubble sort to pancake sort by keeping the array
            representation and adding range operations: finding a maximum and reversing a prefix.
            How might we extend it further to more complex algorithms with different data structures?
            Dijkstra's shortest-path algorithm offers one example. The state would be a graph
            with distances and visited marks;
            the primitive pens would include <code>ExtractMin</code>, <code>MarkVisited</code>,
            and <code>RelaxEdge</code>. The animation sketches how these operations might look.
          </p>
        </div>
        <div className="sk-main sk-dijkstra-demo">
          <figure className="sk-dijkstra-figure">
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={`${import.meta.env.BASE_URL}blog/sketchmind/dijkstra-concept-still.png`} />
              <img src={`${import.meta.env.BASE_URL}blog/sketchmind/dijkstra-concept.gif`} loading="lazy" alt="Concept animation of Dijkstra on a four-node graph, using ExtractMin, MarkVisited, and RelaxEdge to find a shortest path." />
            </picture>
          </figure>
        </div>
        <aside className="sk-margin sk-dijkstra-note">
          <p>
            To support Dijkstra,
            developers would need to add the graph display, define what each operation does,
            and specify what the solver should check. The current interface lets users
            combine existing pens. It does not let them define new operations.
          </p>
        </aside>
      </section>

      <section className="sk-essay-section" aria-label="Learners' visual language" id="abstract-pen">
        <div className="sk-main">
          <p>
            <strong className="sk-run-in">What if the values were shapes?</strong>{' '}
            P13 drew bubble sort using actual bubbles, with size standing for value.
            That drawing raises a different question: must a learner replace their notation
            with handwritten numerals before the system can execute it?
          </p>
          <p>
            You can use several strokes
            for each shape. Strokes that touch or cross become one element. An outline also groups
            the strokes inside it, so a face with separate eyes and a mouth can be one element.
            Draw a few shapes and
            tap their number labels to change the assigned values. Choose <b>Make array</b>,
            then draw a Bubble up stroke across a range. One stroke runs a pass;
            repeat it if the shapes are not yet sorted.
          </p>
          <div className="sk-demo"><AbstractPen /></div>
        </div>
        <aside className="sk-margin">
          <p>
            It treats every mark as a drawing and gives each shape an initial value
            based on its size. Select the value to enter a different number.
            To support these drawings, the system would need a way for learners to explain
            what their marks represent.
          </p>
        </aside>
      </section>

      <details className="sk-cite" open>
        <summary>Cite our work</summary>
        <pre>{CITATION}{'\n'}<a href="https://doi.org/10.1145/3830398.3830500">https://doi.org/10.1145/3830398.3830500</a></pre>
        <div className="sk-cite-actions">
          <button type="button" onClick={copyBibtex}><Copy size={14} aria-hidden="true" /> Copy BibTeX</button>
          <span role="status">{copyStatus}</span>
        </div>
      </details>
    </article>
  )
}
