import { Routes, Route } from 'react-router-dom';
import AcademyIndex from './AcademyIndex';
import ChapterPage from './ChapterPage';
import GlossaryPage from './GlossaryPage';
import { BookmarksPage, NotesPage, SavedPage } from './ListPages';
import './academy.css';

export default function Academy() {
  return (
    <Routes>
      <Route index element={<AcademyIndex />} />
      <Route path="glossary" element={<GlossaryPage />} />
      <Route path="bookmarks" element={<BookmarksPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="saved" element={<SavedPage />} />
      <Route path=":slug" element={<ChapterPage />} />
    </Routes>
  );
}
