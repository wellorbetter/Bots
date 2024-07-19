package com.kob.backend.controller.pk;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author wellorbetter
 * @since 2024/7/19 22:01
 */
@Controller
@RequestMapping("/pk/")
public class IndexController {
    @RequestMapping("index")
    public String index() {
        return "/pk/index.html";
    }
}
