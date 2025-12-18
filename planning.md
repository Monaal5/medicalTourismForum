# Medical Tourism Forum - Missing Features Planning

Based on the comparison between the current codebase and the 4-Week Development Timeline, the following features are pending implementation.

## Week 1: v1.0 - Core Foundation (MVP)

- [ #] **Medical-advice disclaimer on every page**: Add a visible banner or persistent footer element (not just a link) warning users that content is not medical advice.
- [ #] **'Neutral Platform / No Affiliation' banner**: Add a prominent banner stating the platform's neutrality.
- [#] **Report abusive posts**: Add a flagged/report button to `PostCard` and `QuestionDetail` that saves to a review queue.
- [ ] **Basic spam protection**: Implement rate limiting or a simple captcha for non-authenticated actions (if any) or stricter post validation.

## Week 2: v2.0 - Enhanced Engagement

- [ ] **Quote & multi-quote reply**: Update `RichTextEditor` and comment logic to support quoting text from previous posts.
- [x] **Anonymous posting option**: Add a "Post Anonymously" toggle in `CreatePostForm` and `AskQuestionForm`.
- [ ] **Thread subscription with email alerts**: Add a backend job to email users when they receive replies (using Resend/SendGrid).
- [ ] **User reputation points**: Create a database field for reputation and logic to increment it based on upvotes/accepted answers.
- [ ] **Warning system (penalties)**: Admin features to issue warnings to users.
- [ ] **'Safe sharing' guidelines display**: Add a visible guideline block on the "Create Post" and "Ask Question" pages.

## Week 3: v3.0 - Community & Content

- [x] **Polls & surveys**: Create a `Poll` component and database schema for voting options.
- [x] **Gamification (Badges & Levels)**: Implement logic to award badges (e.g., "Top Contributor") based on reputation points.
- [x] **'Success stories' showcase section**: Create a dedicated category or page layout for success stories.
- [x] **'Travel tips & experiences' corner**: Create a dedicated section for logistics and travel advice.
- [ ] **'Before & after treatment' gallery**: A specific rich-media gallery view for treatment results (with privacy blurs).
- [ ] **Resource library**: A page for static guides, PDFs, and official documents.
- [ ] **Neutral comparison tables**: A component to compare countries/visas side-by-side.
- [ ] **Community-curated wiki**: A wiki-style section editable by high-reputation members.
- [ ] **Independent patient reviews section**: Structured review system for hospitals/doctors (distinct from forum posts).
- [ ] **Auto-translate integration**: Integrate a translation API (Google/DeepL) to translate posts on demand.
- [ ] **Moderator escalation system**: UI for moderators to manage reports.
- [ ] **Shadow banning**: Logic to hide posts from a banned user to everyone else.
- [ ] **Progressive Web App (PWA)**: Configure `next-pwa` and `manifest.json`.

## Week 4: v4.0 - Growth & Advanced Features

- [ ] **AI-powered thread recommendations**: Use embeddings to suggest relevant threads to users.
- [ ] **AI-assisted onboarding**: Chatbot or form to guide users to the right categories.
- [x] **Smart content suggestions**: AI analysis of draft posts to suggest tags or similar existing topics.
- [ ] **AMA (Ask Me Anything) sessions**: Specific post type or event scheduler for AMAs.
- [x] **Virtual events & webinars integration**: Calendar and link integration for events. (Admin Events Popup Implemented)
- [ ] **Newsletter integration**: Weekly highlights generator (can be automated with AI).
- [ ] **Referral rewards system**: Database tracking for user referrals.
- [ ] **Community challenges**: System for weekly prompts or engagement goals.
- [ ] **Verified resource center**: Database of embassies and official contacts.
- [ ] **Neutral marketplace**: A directory for insurance, translators, etc.
- [ ] **Patient journey timeline**: A "Diary" post type that strings together updates from a single patient.
- [ ] **Advanced analytics dashboard**: Admin view of growth metrics.
