import EventBus from './common/event-bus/index.js';
import PageModel from './common/page-model/index.js';

App({
    onLaunch: function(options) {},
    eventBus: new EventBus(),
    pageModel: new PageModel(),
    globalData: { count: 0 },
});
