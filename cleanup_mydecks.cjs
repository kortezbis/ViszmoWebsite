const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Kortez', 'Desktop', 'ViszmoSAAS', 'Website', 'WebApp-Vis', 'src', 'dashboard', 'pages', 'MyDecksPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove unused states
content = content.replace(/const \[isUnifiedModalOpen, setIsUnifiedModalOpen\] = useState\(false\);/g, '');
content = content.replace(/const \[isUnifiedModalClosing, setIsUnifiedModalClosing\] = useState\(false\);/g, '');
content = content.replace(/const \[isCreateModalClosing, setIsCreateModalClosing\] = useState\(false\);/g, '');
content = content.replace(/const \[createName, setCreateName\] = useState\(''\);/g, '');
content = content.replace(/const \[createSaving, setCreateSaving\] = useState\(false\);/g, '');
content = content.replace(/const \[createColor, setCreateColor\] = useState\('#3B82F6'\);/g, '');

// 2. Fix the component call at the end
const createModalRegex = /<CreateModal\s+isOpen=\{isCreateModalOpen\}\s+onClose=\{\(\) => \{.*?\}\}\s+initialWorkspaceId=\{selectedWorkspaceId\}\s+\/>/gs;
const newCreateModal = `<CreateModal 
                isOpen={isCreateModalOpen} 
                onClose={closeCreateModal} 
                initialWorkspaceId={selectedWorkspaceId}
                initialStep={modalInitialStep}
            />`;
content = content.replace(createModalRegex, newCreateModal);

// 3. Fix the closeCreateModal function
const closeCreateModalRegex = /const closeCreateModal = \(\) => \{.*?\};/gs;
const newCloseCreateModal = `const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setModalInitialStep(undefined);
        setSelectedWorkspaceId(null);
    };`;
content = content.replace(closeCreateModalRegex, newCloseCreateModal);

// 4. Remove handleCreateSave
const handleCreateSaveRegex = /const handleCreateSave = async \(\) => \{.*?\};/gs;
content = content.replace(handleCreateSaveRegex, '');

// 5. Remove the legacy modal block
const legacyModalRegex = /\{\/\* Create Modal - dashvis style \*\/.*?\{isCreateModalOpen \|\| isCreateModalClosing\) && \(.*?<\/div>\s+<\/div>\s+<\/div>\s+\)\}/gs;
content = content.replace(legacyModalRegex, '');

// 6. Fix "Create Deck" buttons to use new logic
content = content.replace(/onClick=\{\(\) => setIsCreateModalOpen\(true\)\}/g, `onClick={() => { setModalInitialStep('create-deck'); setIsCreateModalOpen(true); }}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Cleanup complete!");
