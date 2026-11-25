import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  createResearchWorkspace,
  deleteResearchWorkspace,
  listWorkspacePapers,
  removePaperFromWorkspace,
  type WorkspacePaperRecord,
} from '../../services/api';
import {
  AlertCircle, Check, FolderKanban, FolderPlus, Layers3, LoaderCircle,
  MessageSquareText, Plus, RefreshCw, Trash2, X,
} from 'lucide-react';

export const WorkspacesPage: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    selectedWorkspaceIds,
    setSelectedWorkspaceIds,
    refreshWorkspaces,
    setActivePage,
  } = useApp();

  const [papers, setPapers] = useState<WorkspacePaperRecord[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [removingPaperId, setRemovingPaperId] = useState<string | null>(null);

  const loadWorkspaces = useCallback(async () => {
    setLoadingWorkspaces(true);
    setError(null);
    try {
      await refreshWorkspaces();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Workspaces could not be loaded.');
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [refreshWorkspaces]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setPapers([]);
      return;
    }
    let active = true;
    setLoadingPapers(true);
    setError(null);
    listWorkspacePapers(activeWorkspaceId)
      .then(result => {
        if (active) setPapers(result.papers);
      })
      .catch(loadError => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Workspace papers could not be loaded.');
      })
      .finally(() => {
        if (active) setLoadingPapers(false);
      });
    return () => { active = false; };
  }, [activeWorkspaceId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = await createResearchWorkspace(name.trim(), description.trim());
      const next = await refreshWorkspaces();
      setActiveWorkspaceId(result.workspace.id);
      setSelectedWorkspaceIds([result.workspace.id]);
      setName('');
      setDescription('');
      setNotice(`Created “${result.workspace.name}”.`);
      if (!next.some(workspace => workspace.id === result.workspace.id)) {
        setError('Workspace creation succeeded, but the refreshed workspace list did not include it.');
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Workspace could not be created.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workspaceId: string, workspaceName: string) => {
    if (!window.confirm(`Delete “${workspaceName}”? Papers and their indexes will remain in your personal library.`)) return;
    setError(null);
    setNotice(null);
    try {
      await deleteResearchWorkspace(workspaceId);
      await refreshWorkspaces();
      setNotice(`Deleted “${workspaceName}”. Its paper records and indexes were kept.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Workspace could not be deleted.');
    }
  };

  const handleRemovePaper = async (paperId: string) => {
    if (!activeWorkspaceId) return;
    setRemovingPaperId(paperId);
    setError(null);
    setNotice(null);
    try {
      await removePaperFromWorkspace(activeWorkspaceId, paperId);
      setPapers(previous => previous.filter(paper => paper.paper_id !== paperId));
      setNotice('Paper removed from this workspace. Its library record and indexes were kept.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Paper could not be removed.');
    } finally {
      setRemovingPaperId(null);
    }
  };

  const toggleResearchScope = (workspaceId: string) => {
    setSelectedWorkspaceIds(previous => previous.includes(workspaceId)
      ? previous.filter(id => id !== workspaceId)
      : [...previous, workspaceId]
    );
  };

  return (
    <div className="min-h-full bg-[#F5F7FB] dark:bg-[#080E1A] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
              <Layers3 className="h-3.5 w-3.5" /> Personal research library
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Research workspaces</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Organize papers by research topic. Select one or more workspaces to define the evidence available to Research Chat.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('chat')}
            disabled={selectedWorkspaceIds.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageSquareText className="h-4 w-4" />
            Research across {selectedWorkspaceIds.length || 0} selected
          </button>
        </header>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {notice && (
          <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="space-y-4">
            <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0E172A]">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Create a workspace</h2>
              </div>
              <label className="mt-4 block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="workspace-name">Workspace name</label>
              <input
                id="workspace-name"
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={100}
                placeholder="e.g. LLM Research"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <label className="mt-3 block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="workspace-description">Description <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                maxLength={1000}
                rows={2}
                placeholder="What research question does this workspace cover?"
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!name.trim() || saving}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create workspace
              </button>
            </form>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0E172A]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Your workspaces</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tick multiple workspaces to combine them for research.</p>
                </div>
                <button type="button" onClick={() => void loadWorkspaces()} aria-label="Refresh workspaces" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                  <RefreshCw className={`h-4 w-4 ${loadingWorkspaces ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {workspaces.map(workspace => (
                  <article key={workspace.id} className={`rounded-xl border p-3 transition ${activeWorkspaceId === workspace.id ? 'border-blue-300 bg-blue-50/60 dark:border-blue-700/70 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedWorkspaceIds.includes(workspace.id)}
                        onChange={() => toggleResearchScope(workspace.id)}
                        aria-label={`Include ${workspace.name} in research scope`}
                        className="mt-1 h-4 w-4 accent-blue-600"
                      />
                      <button type="button" onClick={() => setActiveWorkspaceId(workspace.id)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{workspace.name}</span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{workspace.description || 'No description yet'}</span>
                      </button>
                      <button type="button" onClick={() => void handleDelete(workspace.id, workspace.name)} title="Delete workspace" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2 dark:border-slate-700/70">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedWorkspaceIds.includes(workspace.id) ? 'Included in research scope' : 'Not included in research scope'}
                      </span>
                      <button type="button" onClick={() => setActiveWorkspaceId(workspace.id)} className={`text-[11px] font-semibold ${activeWorkspaceId === workspace.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-blue-700 dark:text-slate-400'}`}>
                        {activeWorkspaceId === workspace.id ? 'Adding papers here' : 'Set as add target'}
                      </button>
                    </div>
                  </article>
                ))}
                {!loadingWorkspaces && workspaces.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                    <FolderKanban className="mx-auto h-7 w-7 text-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">No workspaces yet</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Create your first workspace, then add papers from Search.</p>
                  </div>
                )}
              </div>
            </section>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0E172A]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace papers</h2>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {workspaces.find(workspace => workspace.id === activeWorkspaceId)?.name || 'Select a workspace'}
                </p>
              </div>
              <button type="button" onClick={() => setActivePage('search')} disabled={!activeWorkspaceId} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                <Plus className="h-3.5 w-3.5" /> Add papers
              </button>
            </div>

            <div className="mt-4">
              {!activeWorkspaceId ? (
                <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Create or select a workspace to see its papers.</div>
              ) : loadingPapers ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading papers…</div>
              ) : papers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
                  <FolderKanban className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">This workspace is empty</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Search for a paper and add it to this workspace.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {papers.map(paper => {
                    const metadata = paper.metadata || {};
                    const title = typeof metadata.title === 'string' ? metadata.title : paper.paper_id;
                    const authors = Array.isArray(metadata.authors)
                      ? metadata.authors.map(author => typeof author === 'string' ? author : (author && typeof author === 'object' && 'name' in author ? String((author as { name: unknown }).name) : '')).filter(Boolean).slice(0, 3).join(', ')
                      : '';
                    const year = typeof metadata.year === 'number' ? metadata.year : undefined;
                    return (
                      <article key={paper.paper_id} className="flex items-start gap-3 py-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold leading-5 text-slate-900 dark:text-white">{title}</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{authors}{year ? ` · ${year}` : ''}</p>
                          <p className="mt-1 break-all text-[10px] text-slate-400 dark:text-slate-500">{paper.paper_id}</p>
                        </div>
                        <button
                          type="button"
                          disabled={removingPaperId === paper.paper_id}
                          onClick={() => void handleRemovePaper(paper.paper_id)}
                          title="Remove from this workspace"
                          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          {removingPaperId === paper.paper_id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Selecting multiple workspaces combines their paper IDs only for retrieval. Removing a workspace from the selected scope does not move, copy, delete or re-index any papers.
        </p>
      </div>
    </div>
  );
};
