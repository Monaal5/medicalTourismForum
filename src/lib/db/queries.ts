
import { supabase } from "@/lib/supabase";



// Helper to map Supabase Post to Sanity-like structure
function mapPost(post: any) {
    return {
        _id: post.id,
        postTitle: post.title,
        body: post.body,
        image: post.image_url ? { asset: { url: post.image_url }, _type: 'image' } : null,
        contentGallery: post.gallery,
        publishedAt: post.published_at,
        tags: post.tags,
        author: post.author ? {
            username: post.author.username,
            imageUrl: post.author.image_url,
            clerkId: post.author.clerk_id
        } : { username: 'Unknown', imageUrl: '' },
        subreddit: post.community ? { ...post.community, slug: { current: post.community.slug } } : null,
        category: post.category ? { ...post.category, slug: { current: post.category.slug } } : null,
        commentCount: post.comments?.[0]?.count || 0
    };
}

// Helper to map Supabase Question to Sanity-like structure
function mapQuestion(question: any) {
    return {
        _id: question.id,
        title: question.title,
        description: question.description,
        author: question.author ? {
            username: question.author.username,
            imageUrl: question.author.image_url,
            clerkId: question.author.clerk_id
        } : { username: 'Unknown', imageUrl: '' },
        category: question.category,
        image: null,
        tags: question.tags,
        isAnswered: question.is_answered,
        isDeleted: false,
        createdAt: question.created_at,
        answerCount: question.answers?.[0]?.count || 0,
        voteCount: 0,
        topAnswer: null
    };
}

// Helper for User Profile
function mapUserProfile(user: any, stats: any, followers: any[] = [], following: any[] = [], badges: any[] = []) {
    return {
        _id: user.id || user._id, // Handle fallback
        clerkId: user.clerk_id,
        username: user.username,
        imageUrl: user.image_url,
        bio: user.bio,
        joinedAt: user.joined_at,
        questionsCount: stats.questionsCount || 0,
        answersCount: stats.answersCount || 0,
        postsCount: stats.postsCount || 0,
        followersCount: stats.followersCount || 0,
        followingCount: stats.followingCount || 0,
        employment: user.employment,
        education: user.education,
        location: user.location,
        socialLinks: user.social_links || {},
        followers: followers,
        following: following,
        badges: badges,
        reputation: user.reputation || 0
    };
}


export async function getHomeQuestions() {
    const { data, error } = await supabase
        .from('questions')
        .select(`
      id,
      title,
      description,
      tags,
      is_answered,
      created_at,
      view_count,
      author:users!author_id (
        username,
        image_url,
        clerk_id
      ),
      category:categories (
        id,
        name,
        icon
      ),
      answers:answers(count)
    `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching home questions:", error);
        return [];
    }

    return data.map(mapQuestion);
}

export async function getHomePosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      id,
      title,
      body,
      image_url,
      gallery,
      published_at,
      tags,
      author:users!author_id (
        username,
        image_url,
        clerk_id
      ),
      community:communities (
        title,
        slug
      ),
      category:categories (
        name,
        slug
      ),
      comments:comments(count)
    `)
        .order('published_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching home posts:", error);
        return [];
    }
    return data.map(mapPost);
}

export async function getHomeCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*, questions(count), posts(count), polls(count)')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching home categories:", error);
        return [];
    }

    return data.map((cat: any) => ({
        _id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        description: cat.description,
        questionCount: cat.questions?.[0]?.count || 0,
        postCount: cat.posts?.[0]?.count || 0,
        pollCount: cat.polls?.[0]?.count || 0
    }));
}

export async function getHomeCommunities() {
    const { data, error } = await supabase
        .from('communities')
        .select(`
      id,
      title,
      slug,
      description,
      image_url,
      created_at
    `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching home communities:", error);
        return [];
    }

    return data.map((comm: any) => ({
        _id: comm.id,
        title: comm.title,
        slug: { current: comm.slug },
        description: comm.description,
        image: comm.image_url ? { asset: { url: comm.image_url } } : null
    }));
}

export async function getUserProfile(username: string) {
    // 1. Get User
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) return null;

    // 2. Get Stats & Lists (Parallel)
    const [qCount, aCount, pCount, followersData, followingData, badgesData] = await Promise.all([
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('answers').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('followers').select('follower:users!follower_id(id, username, image_url)').eq('following_id', user.id),
        supabase.from('followers').select('following:users!following_id(id, username, image_url)').eq('follower_id', user.id),
        supabase.from('user_badges').select('awarded_at, badge:badges(name, icon_url, description)').eq('user_id', user.id)
    ]);

    const followers = followersData.data?.map((f: any) => ({
        _id: f.follower.id,
        username: f.follower.username,
        imageUrl: f.follower.image_url
    })) || [];

    const following = followingData.data?.map((f: any) => ({
        _id: f.following.id,
        username: f.following.username,
        imageUrl: f.following.image_url
    })) || [];

    const badges = badgesData.data?.map((b: any) => ({
        name: b.badge.name,
        iconUrl: b.badge.icon_url,
        description: b.badge.description,
        awardedAt: b.awarded_at
    })) || [];

    const stats = {
        questionsCount: qCount.count,
        answersCount: aCount.count,
        postsCount: pCount.count,
        followersCount: followers.length,
        followingCount: following.length
    };

    return mapUserProfile(user, stats, followers, following, badges);
}

export async function getUserQuestions(username: string) {
    // Need user ID first, or join. Join is better but let's assume we have username.
    // Efficient way: Join on author logic
    const { data } = await supabase
        .from('questions')
        .select(`
            id,
            title,
            created_at,
            author:users!inner(username),
            category:categories(name),
            answers:answers(count)
        `)
        .eq('author.username', username)
        .order('created_at', { ascending: false })
        .limit(10);

    if (!data) return [];

    return data.map((q: any) => ({
        _id: q.id,
        title: q.title,
        createdAt: q.created_at,
        answerCount: q.answers?.[0]?.count || 0,
        category: q.category ? { name: q.category.name, color: 'blue' } : null
    }));
}

export async function getUserPosts(username: string) {
    const { data } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            body,
            image_url,
            published_at,
            author:users!inner(username),
            community:communities(title, slug),
            comments:comments(count)
        `)
        .eq('author.username', username)
        .order('published_at', { ascending: false })
        .limit(10);

    if (!data) return [];
    return data.map(mapPost);
}

export async function getUserAnswers(username: string) {
    const { data } = await supabase
        .from('answers')
        .select(`
            id,
            body,
            created_at,
            author:users!inner(username),
            question:questions(id, title)
        `)
        .eq('author.username', username)
        .order('created_at', { ascending: false })
        .limit(10);

    if (!data) return [];

    return data.map((a: any) => ({
        _id: a.id,
        content: a.body, // Tiptap JSON or text
        question: a.question ? { _id: a.question.id, title: a.question.title } : null,
        createdAt: a.created_at,
        voteCount: 0
    }));
}

export async function getQuestionsByCategory(categorySlug: string) {
    const { data, error } = await supabase
        .from('questions')
        .select(`
            id,
            title,
            description,
            tags,
            is_answered,
            created_at,
            view_count,
            author:users!author_id (username, image_url, clerk_id),
            category:categories!inner (id, name, icon, slug),
            answers:answers(count)
        `)
        .eq('category.slug', categorySlug)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching questions by category:", error);
        return [];
    }

    return data.map((q: any) => ({
        ...mapQuestion(q),
        category: {
            ...q.category,
            slug: { current: q.category.slug }
        }
    }));
}

export async function getAllCommunities() {
    const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_deleted', false)
        .order('title', { ascending: true });

    if (error) {
        console.error("Error fetching all communities:", error);
        return [];
    }

    return data.map((comm: any) => ({
        _id: comm.id,
        title: comm.title,
        slug: { current: comm.slug },
        description: comm.description,
        image: comm.image_url ? { asset: { url: comm.image_url } } : null,
        memberCount: 0, // Implement if needed
        createdAt: comm.created_at || new Date().toISOString()
    }));
}

export async function getCommunityBySlug(slug: string) {
    const { data } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!data) return null;

    return {
        _id: data.id,
        title: data.title,
        slug: { current: data.slug },
        description: data.description,
        image: data.image_url ? { asset: { url: data.image_url } } : null,
        moderatorId: data.moderator_id
    };
}

export async function getPostById(id: string) {
    // Note: If ID is invalid uuid, this will error. Should validate or try-catch.
    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            body,
            image_url,
            gallery,
            published_at,
            tags,
            author:users!author_id (username, image_url, clerk_id),
            community:communities (title, slug),
            category:categories (name, slug),
            comments:comments (
                id,
                body,
                created_at,
                author:users!author_id (username, image_url),
                parent_comment_id
            ),
            polls (
                id,
                question,
                expires_at,
                poll_options (
                    id,
                    option_text,
                    vote_count
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) return null;

    // Enrich with actual comments array (mapPost maps count only)
    const comments = data.comments?.map((c: any) => ({
        _id: c.id,
        comment: c.body,
        author: {
            username: c.author?.username || 'Unknown',
            imageUrl: c.author?.image_url || null
        },
        createdAt: c.created_at,
        parent_comment_id: c.parent_comment_id
    })) || [];

    const post = mapPost(data);

    // Process Poll
    const poll = data.polls && data.polls.length > 0 ? {
        id: data.polls[0].id,
        question: data.polls[0].question,
        expires_at: data.polls[0].expires_at,
        options: data.polls[0].poll_options || [],
        total_votes: (data.polls[0].poll_options || []).reduce((acc: number, curr: any) => acc + (curr.vote_count || 0), 0),
        user_voted_option_id: null // We don't fetch user context here
    } : null;

    return { ...post, comments, poll };
}

export async function getQuestionById(id: string) {
    const { data, error } = await supabase
        .from('questions')
        .select(`
            id,
            title,
            description,
            tags,
            is_answered,
            created_at,
            view_count,
            author:users!author_id (username, image_url, clerk_id),
            category:categories (id, name, icon, slug),
            answers:answers (
                 id,
                 body,
                 created_at,
                 is_accepted,
                 author:users!author_id (username, image_url),
                 votes:votes (vote_type) 
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) return null;

    const question = mapQuestion(data);

    // Enrich answers
    const answers = data.answers?.map((a: any) => ({
        _id: a.id,
        content: a.body,
        author: {
            username: a.author?.username || 'Unknown',
            imageUrl: a.author?.image_url || null
        },
        createdAt: a.created_at,
        isAccepted: a.is_accepted,
        voteCount: (a.votes?.filter((v: any) => v.vote_type === 'upvote').length || 0) - (a.votes?.filter((v: any) => v.vote_type === 'downvote').length || 0)
    })) || [];

    return { ...question, answers, category: question.category ? { ...question.category, slug: { current: question.category.slug } } : null };
}

export async function getSuccessStoriesPosts() {
    // 1. Get Category ID if possible or join
    // We can join on categories and filter
    const { data, error } = await supabase
        .from('posts')
        .select(`
      id,
      title,
      body,
      image_url,
      gallery,
      published_at,
      tags,
      author:users!author_id (
        username,
        image_url,
        clerk_id
      ),
      community:communities (
        title,
        slug
      ),
      category:categories!inner (
        name,
        slug
      ),
      comments:comments(count)
    `)
        .eq('category.slug', 'success-stories')
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Error fetching success stories:", error);
        return [];
    }
    return data.map(mapPost);
}

export async function getTravelTipsPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      id,
      title,
      body,
      image_url,
      gallery,
      published_at,
      tags,
      author:users!author_id (
        username,
        image_url,
        clerk_id
      ),
      community:communities (
        title,
        slug
      ),
      category:categories!inner (
        name,
        slug
      ),
      comments:comments(count)
    `)
        .eq('category.slug', 'travel-tips')
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Error fetching travel tips:", error);
        return [];
    }
    return data.map(mapPost);
}
