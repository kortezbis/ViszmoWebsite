const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Kortez', 'Desktop', 'ViszmoSAAS', 'Website', 'WebApp-Vis', 'src', 'dashboard', 'pages', 'MyDecksPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const correctBlock = `                                            {/* Podcast Menu */}
                                            {activeMenuId === \`pod-\${p.id}\` && (
                                                <div
                                                    className="absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl popover-menu-dropdown-animate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                                                        onClick={() => navigate(\`/dashboard/podcasts/\${p.id}\`)}
                                                    >
                                                        <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                                                        Open
                                                    </button>
                                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                                                    <button
                                                        type="button"
                                                        className={\`hold-to-delete-container \${isDeleteHolding === \`pod-\${p.id}\` ? 'hold-to-delete-active' : ''}\`}
                                                        onMouseDown={() => setIsDeleteHolding(\`pod-\${p.id}\`)}
                                                        onMouseUp={() => setIsDeleteHolding(null)}
                                                        onMouseLeave={() => setIsDeleteHolding(null)}
                                                        onTouchStart={() => setIsDeleteHolding(\`pod-\${p.id}\`)}
                                                        onTouchEnd={() => setIsDeleteHolding(null)}
                                                    >
                                                        <div className="hold-to-delete-progress" />
                                                        <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                            <Trash2 size={16} className="shrink-0" />
                                                            <span className="font-bold">
                                                                {isDeleteHolding === \`pod-\${p.id}\` ? 'Hold to confirm' : 'Delete'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'Trash' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Deleted Items</h4>
                            {(deletedItems.workspaces.length > 0 || deletedItems.decks.length > 0 || deletedItems.lectures.length > 0 || deletedItems.studyGuides.length > 0 || deletedItems.practiceTests.length > 0) && (
                                <button
                                    onClick={handleEmptyTrash}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 size={14} />
                                    Empty Trash
                                </button>
                            )}
                        </div>
                        {(deletedItems.workspaces.length === 0 && deletedItems.decks.length === 0 && deletedItems.lectures.length === 0 && deletedItems.studyGuides.length === 0 && deletedItems.practiceTests.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface-hover/20">
                                <div className="w-16 h-16 bg-zinc-500/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Trash2 size={32} className="text-zinc-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">Trash is empty</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm font-medium">
                                    Items you delete will stay here for 30 days before being permanently removed.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {deletedItems.workspaces.map(ws => (
                                    <div key={ws.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.color }} />`;

const regex = /^[ \t]*\{\/\* Podcast Menu \*\/\}.*?<div className="w-3 h-3 rounded-full" style={{ backgroundColor: ws\.color }} \/>/ms;

if (regex.test(content)) {
    content = content.replace(regex, correctBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully fixed MyDecksPage.tsx!");
} else {
    console.log("Could not find the target block to replace.");
}
